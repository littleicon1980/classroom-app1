package app.classroomdashboard.teacher;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintJob;
import android.print.PrintManager;
import android.webkit.WebView;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Opens the Android print dialog (Print / Save as PDF) for the current web page. */
@CapacitorPlugin(name = "NativePrint")
public class NativePrintPlugin extends Plugin {

    @PluginMethod
    public void print(final PluginCall call) {
        final String name = call.getString("name", "Document");
        final boolean landscape = Boolean.TRUE.equals(call.getBoolean("landscape", false));
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    WebView webView = getBridge().getWebView();
                    PrintManager pm = (PrintManager) getActivity().getSystemService(Context.PRINT_SERVICE);
                    PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(name);
                    PrintAttributes.MediaSize size = PrintAttributes.MediaSize.ISO_A4;
                    if (landscape) size = size.asLandscape();
                    PrintAttributes attrs = new PrintAttributes.Builder()
                            .setMediaSize(size)
                            .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                            .build();
                    final PrintJob job = pm.print(name, adapter, attrs);
                    // resolve once the user finishes / cancels, so the page can restore its screen state
                    final Handler h = new Handler(Looper.getMainLooper());
                    h.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            if (job.isCompleted() || job.isFailed() || job.isCancelled()) {
                                call.resolve();
                            } else {
                                h.postDelayed(this, 700);
                            }
                        }
                    }, 1500);
                } catch (Exception e) {
                    call.reject("print failed: " + e.getMessage());
                }
            }
        });
    }
}
