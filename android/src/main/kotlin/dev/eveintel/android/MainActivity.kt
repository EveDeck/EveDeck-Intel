package dev.eveintel.android

import android.Manifest
import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.text.InputType
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.LinearLayout
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/**
 * A thin WebView shell around the daemon's own web UI (daemon/src/main/resources/web/index.html).
 *
 * There used to be a full Compose UI here duplicating that page's feed/map/settings screens --
 * two implementations of the same display, which is exactly the kind of drift that bites: a fix
 * made to one silently doesn't apply to the other. The web UI is now the only UI; this activity's
 * job is just to show it without a browser's chrome around it, and to keep [IntelService] (which
 * this activity does not otherwise touch) reachable for the settings it needs.
 *
 * [IntelService] stays a native background service rather than folding into the web page: a
 * closed or backgrounded WebView cannot run JavaScript to notice a hostile arriving, but a
 * `specialUse` foreground service can. [SettingsBridge] is what keeps that service's alert
 * settings in sync with whatever the user sets on the web page's own Settings tab, so there is
 * still only one place to configure an alert -- it just writes to two stores under the hood.
 */
class MainActivity : ComponentActivity() {

    private lateinit var settings: Settings
    private lateinit var webView: WebView

    /** The only host [webView]'s [WebViewClient] will navigate to -- see [buildWebView]. */
    private var allowedHost: String? = null

    private val notificationPermission = registerForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { /* Alerts simply stay silent if declined. */ }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestNotificationPermission()
        IntelService.start(this)

        settings = Settings(this)
        webView = buildWebView()

        val root = FrameLayout(this).apply {
            addView(
                webView,
                FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT),
            )
            addView(
                buildConnectButton(),
                FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT).apply {
                    gravity = Gravity.TOP or Gravity.END
                    topMargin = dp(28)
                    rightMargin = dp(20)
                },
            )
        }
        setContentView(root)
        enterImmersiveMode()

        lifecycleScope.launch {
            settings.state.collect { snapshot ->
                if (snapshot.keepScreenOn) {
                    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                } else {
                    window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                }
            }
        }

        val current = settings.state.value
        if (current.isConfigured) loadDaemon(current.serverHost, current.serverPort) else showConnectDialog(firstRun = true)
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        // A dialog, the notification shade, or a system overlay all clear the immersive flags;
        // this is the standard "sticky immersive" re-assertion point once the window has focus
        // back, rather than something the user has to fight with a repeated swipe.
        if (hasFocus) enterImmersiveMode()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    private fun enterImmersiveMode() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun buildWebView(): WebView {
        val webView = WebView(this)
        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            // The web UI's screen-timeout fallback plays a silent canvas-captured video; this is
            // what lets it autoplay without a tap, matching desktop Chrome's own allowance for a
            // muted, inaudible video.
            mediaPlaybackRequiresUserGesture = false
        }
        webView.setBackgroundColor(Color.parseColor("#0B0F14"))
        // Exposed to whatever page is loaded, so navigation is locked to the configured daemon
        // below -- an interface reachable from arbitrary web content is a real attack surface,
        // and this one can write to this device's alert-notification settings.
        webView.addJavascriptInterface(SettingsBridge(), "AndroidBridge")
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val host = request.url.host
                if (host != null && host == allowedHost) return false
                // The feed links out to dscan/adashboard reports pasted into intel channels --
                // those need to actually open, just never inside this WebView (which stays locked
                // to the daemon's own origin). Hand off to whatever the device's browser is.
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, request.url))
                } catch (e: ActivityNotFoundException) {
                    Log.w("MainActivity", "no app to open ${request.url}", e)
                }
                return true
            }
        }
        return webView
    }

    private fun loadDaemon(host: String, port: Int) {
        allowedHost = host
        webView.loadUrl("http://$host:$port/")
    }

    private fun showConnectDialog(firstRun: Boolean) {
        val current = settings.state.value
        val hostInput = EditText(this).apply {
            hint = "Daemon's LAN IP, e.g. 192.168.1.50"
            setText(current.serverHost)
        }
        val portInput = EditText(this).apply {
            hint = "Port"
            inputType = InputType.TYPE_CLASS_NUMBER
            setText(current.serverPort.toString())
        }
        val form = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            val pad = dp(24)
            setPadding(pad, dp(8), pad, 0)
            addView(hostInput)
            addView(portInput)
        }

        val builder = android.app.AlertDialog.Builder(this)
            .setTitle("Connect to EveDeck Intel")
            .setView(form)
            .setCancelable(!firstRun)
            .setPositiveButton("Connect") { _, _ ->
                val host = hostInput.text.toString().trim()
                val port = portInput.text.toString().trim().toIntOrNull() ?: 31337
                if (host.isNotEmpty()) {
                    settings.update { it.copy(serverHost = host, serverPort = port) }
                    loadDaemon(host, port)
                }
            }
        if (!firstRun) builder.setNegativeButton("Cancel", null)
        builder.show()
    }

    /** Reopens [showConnectDialog] -- the only way to fix a daemon that moved to a new LAN IP. */
    private fun buildConnectButton(): View = Button(this).apply {
        text = "⚙"
        textSize = 18f
        setTextColor(Color.parseColor("#7A8899"))
        setBackgroundColor(Color.TRANSPARENT)
        alpha = 0.7f
        setOnClickListener { showConnectDialog(firstRun = false) }
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return
        val granted = ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
            PackageManager.PERMISSION_GRANTED
        if (!granted) notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
    }

    /**
     * Lets the web page's own Settings tab (dev\eveintel\daemon\src\main\resources\web\index.html,
     * `LocalSettings.save()`) be the single place a user configures alerts, while still keeping
     * [IntelService]'s native SharedPreferences copy current -- that copy is what the background
     * service reads when this WebView isn't even running.
     */
    private inner class SettingsBridge {
        @JavascriptInterface
        fun onSettingsChanged(json: String) {
            val parsed = try {
                Json.decodeFromString<WebSettingsPayload>(json)
            } catch (e: Exception) {
                Log.e("MainActivity", "settings bridge: malformed payload from web UI", e)
                return
            }
            settings.update { current ->
                current.copy(
                    alertCharacters = parsed.alertCharacters.toSet(),
                    alertJumpRadius = parsed.alertJumpRadius,
                    alertOnClear = parsed.alertOnClear,
                    keepScreenOn = parsed.keepScreenOn,
                )
            }
        }
    }

    @Serializable
    private data class WebSettingsPayload(
        val alertCharacters: List<String> = emptyList(),
        val alertJumpRadius: Int = 5,
        val alertOnClear: Boolean = false,
        val keepScreenOn: Boolean = true,
    )
}
