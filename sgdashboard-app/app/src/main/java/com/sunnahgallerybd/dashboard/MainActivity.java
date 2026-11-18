package com.sunnahgallerybd.dashboard;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

/** Phone-friendly wrapper for the sunnahgallerybd.com dashboard. Needs an internet connection. */
public class MainActivity extends Activity {

    private static final String HOME_URL = "https://sunnahgallerybd.com/dashboard";
    private static final String HOME_HOST = "sunnahgallerybd.com";
    private static final int FILE_CHOOSER_REQUEST = 1;
    private static final int STORAGE_REQUEST = 2;

    /**
     * Small CSS fixes so desktop-style dashboard pages behave on a phone:
     * wide tables scroll sideways instead of overflowing the screen, images
     * shrink to fit, and form fields use 16px text so the page does not zoom
     * in when you tap one.
     */
    private static final String PHONE_CSS =
            "table{display:block;max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}"
            + "img,video,canvas,iframe{max-width:100%!important;height:auto}"
            + "input,select,textarea{font-size:16px!important}"
            + "pre,code{white-space:pre-wrap;word-break:break-word}"
            + "*{-webkit-tap-highlight-color:rgba(0,0,0,0.08)}";

    private static final String PHONE_JS =
            "(function(){"
            + "if(!document.querySelector('meta[name=viewport]')){"
            + "var m=document.createElement('meta');m.name='viewport';"
            + "m.content='width=device-width,initial-scale=1';document.head.appendChild(m);}"
            + "if(!document.getElementById('sg-phone-css')){"
            + "var s=document.createElement('style');s.id='sg-phone-css';"
            + "s.textContent=" + jsString(PHONE_CSS) + ";document.head.appendChild(s);}"
            + "})();";

    private WebView webView;
    private SwipeRefreshLayout swipe;
    private ProgressBar progressBar;
    private View errorView;
    private View splashView;
    private ValueCallback<Uri[]> filePathCallback;
    private long lastBackPress;
    private String[] pendingDownload;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.WHITE);

        webView = new WebView(this);
        swipe = new SwipeRefreshLayout(this);
        swipe.addView(webView, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        swipe.setColorSchemeColors(Color.parseColor("#212121"));
        swipe.setOnRefreshListener(() -> webView.reload());
        // Only pull-to-refresh when the page is scrolled to the very top.
        swipe.setOnChildScrollUpCallback((parent, child) -> webView.getScrollY() > 0);
        root.addView(swipe, matchParent());

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        root.addView(progressBar, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, dp(4), Gravity.TOP));

        errorView = buildErrorView();
        errorView.setVisibility(View.GONE);
        root.addView(errorView, matchParent());

        splashView = buildSplash();
        root.addView(splashView, matchParent());

        setContentView(root);
        setUpWebView();

        if (savedInstanceState != null) {
            splashView.setVisibility(View.GONE);
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(HOME_URL);
        }
    }

    private void setUpWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        // Pinch-zoom stays available for wide reports, without the +/- buttons.
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleUrl(request.getUrl());
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                progressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageCommitVisible(WebView view, String url) {
                view.evaluateJavascript(PHONE_JS, null);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                view.evaluateJavascript(PHONE_JS, null);
                progressBar.setVisibility(View.GONE);
                swipe.setRefreshing(false);
                splashView.setVisibility(View.GONE);
                CookieManager.getInstance().flush();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    swipe.setRefreshing(false);
                    splashView.setVisibility(View.GONE);
                    errorView.setVisibility(View.VISIBLE);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                }
                filePathCallback = callback;
                try {
                    startActivityForResult(params.createIntent(), FILE_CHOOSER_REQUEST);
                } catch (ActivityNotFoundException e) {
                    filePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        // Reports, invoices and exports: save them with the logged-in session.
        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, length) -> {
            pendingDownload = new String[]{url, userAgent, contentDisposition, mimeType};
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q
                    && checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE)
                    != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, STORAGE_REQUEST);
            } else {
                startDownload();
            }
        });
    }

    private void startDownload() {
        if (pendingDownload == null) {
            return;
        }
        String url = pendingDownload[0];
        if (!url.startsWith("http")) {
            Toast.makeText(this, "এই ফাইলটা অ্যাপ থেকে নামানো যাচ্ছে না", Toast.LENGTH_LONG).show();
            pendingDownload = null;
            return;
        }
        try {
            String fileName = URLUtil.guessFileName(url, pendingDownload[2], pendingDownload[3]);
            DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url));
            req.setMimeType(pendingDownload[3]);
            req.addRequestHeader("Cookie", CookieManager.getInstance().getCookie(url));
            req.addRequestHeader("User-Agent", pendingDownload[1]);
            req.setTitle(fileName);
            req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            req.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
            ((DownloadManager) getSystemService(DOWNLOAD_SERVICE)).enqueue(req);
            Toast.makeText(this, "ডাউনলোড হচ্ছে: " + fileName, Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            Toast.makeText(this, "ডাউনলোড করা গেল না", Toast.LENGTH_LONG).show();
        }
        pendingDownload = null;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        if (requestCode == STORAGE_REQUEST) {
            if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) {
                startDownload();
            } else {
                pendingDownload = null;
                Toast.makeText(this, "ফাইল রাখার অনুমতি ছাড়া ডাউনলোড হবে না", Toast.LENGTH_LONG).show();
            }
        }
    }

    /** Dashboard pages stay in the app; WhatsApp, phone, email, maps etc. open their own apps. */
    private boolean handleUrl(Uri uri) {
        String scheme = uri.getScheme() == null ? "" : uri.getScheme();
        String host = uri.getHost() == null ? "" : uri.getHost();

        boolean isWeb = scheme.equals("http") || scheme.equals("https");
        boolean isSite = host.equals(HOME_HOST) || host.endsWith("." + HOME_HOST);
        if (isWeb && isSite) {
            return false;
        }

        try {
            Intent intent = scheme.equals("intent")
                    ? Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME)
                    : new Intent(Intent.ACTION_VIEW, uri);
            startActivity(intent);
            return true;
        } catch (Exception e) {
            return !isWeb;
        }
    }

    private View buildSplash() {
        FrameLayout box = new FrameLayout(this);
        box.setBackgroundColor(Color.parseColor("#EDEDED"));
        box.setClickable(true);
        ImageView logo = new ImageView(this);
        logo.setImageResource(R.mipmap.ic_launcher_foreground);
        box.addView(logo, new FrameLayout.LayoutParams(dp(220), dp(220), Gravity.CENTER));
        return box;
    }

    private View buildErrorView() {
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER);
        box.setBackgroundColor(Color.WHITE);
        box.setPadding(dp(32), dp(32), dp(32), dp(32));

        TextView msg = new TextView(this);
        msg.setText("ইন্টারনেট সংযোগ নেই\nNo internet connection");
        msg.setTextSize(18);
        msg.setGravity(Gravity.CENTER);
        msg.setTextColor(Color.DKGRAY);
        box.addView(msg);

        Button retry = new Button(this);
        retry.setText("আবার চেষ্টা করুন / Retry");
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        p.topMargin = dp(24);
        retry.setOnClickListener(v -> {
            errorView.setVisibility(View.GONE);
            webView.reload();
        });
        box.addView(retry, p);
        return box;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST && filePathCallback != null) {
            filePathCallback.onReceiveValue(
                    WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            filePathCallback = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        if (errorView.getVisibility() == View.VISIBLE) {
            errorView.setVisibility(View.GONE);
        }
        if (webView.canGoBack()) {
            webView.goBack();
            return;
        }
        // Avoid closing the dashboard by accident: press back twice to exit.
        long now = System.currentTimeMillis();
        if (now - lastBackPress < 2000) {
            super.onBackPressed();
        } else {
            lastBackPress = now;
            Toast.makeText(this, "বের হতে আবার Back চাপুন", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }

    private FrameLayout.LayoutParams matchParent() {
        return new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private static String jsString(String s) {
        return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'";
    }
}
