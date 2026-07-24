package com.neonbrickbreaker.ball;

import android.util.Log;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.chartboost.sdk.Chartboost;
import com.chartboost.sdk.ads.Banner;
import com.chartboost.sdk.ads.Interstitial;
import com.chartboost.sdk.ads.Rewarded;
import com.chartboost.sdk.callbacks.BannerCallback;
import com.chartboost.sdk.callbacks.InterstitialCallback;
import com.chartboost.sdk.callbacks.RewardedCallback;
import com.chartboost.sdk.callbacks.StartCallback;
import com.chartboost.sdk.events.CacheError;
import com.chartboost.sdk.events.CacheEvent;
import com.chartboost.sdk.events.ClickError;
import com.chartboost.sdk.events.ClickEvent;
import com.chartboost.sdk.events.DismissEvent;
import com.chartboost.sdk.events.ImpressionEvent;
import com.chartboost.sdk.events.RewardEvent;
import com.chartboost.sdk.events.ShowError;
import com.chartboost.sdk.events.ShowEvent;
import com.chartboost.sdk.events.StartError;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ChartboostPlugin")
public class ChartboostPlugin extends Plugin {

    private static final String TAG = "ChartboostPlugin";
    private Banner chartboostBanner = null;
    private Rewarded chartboostRewarded = null;
    private Interstitial chartboostInterstitial = null;

    @PluginMethod
    public void initialize(PluginCall call) {
        String appId = call.getString("appId");
        String appSignature = call.getString("appSignature");

        if (appId == null || appSignature == null) {
            call.reject("App ID and App Signature required");
            return;
        }

        Chartboost.startWithAppId(getContext(), appId, appSignature, new StartCallback() {
            @Override
            public void onStartCompleted(@Nullable StartError startError) {
                if (startError == null) {
                    Log.d(TAG, "Chartboost initialized successfully");
                    call.resolve();
                } else {
                    Log.e(TAG, "Chartboost failed to initialize: " + startError.toString());
                    call.reject("Chartboost failed to initialize");
                }
            }
        });
    }

    @PluginMethod
    public void showBanner(PluginCall call) {
        String location = call.getString("location", "Default");

        getActivity().runOnUiThread(() -> {
            if (chartboostBanner != null) removeBanner();

            chartboostBanner = new Banner(getContext(), location, Banner.BannerSize.STANDARD, new BannerCallback() {
                public void onAdLoaded(@NonNull CacheEvent event, @Nullable CacheError error) {
                    if (error == null) chartboostBanner.show();
                }

                public void onAdShown(@NonNull ShowEvent event, @Nullable ShowError error) {
                    if (error == null) {
                        JSObject ret = new JSObject();
                        ret.put("event", "onAdShown");
                        notifyListeners("bannerEvent", ret);
                    }
                }

                public void onAdClicked(@NonNull ClickEvent event, @Nullable ClickError error) {}
                public void onImpressionRecorded(@NonNull ImpressionEvent event) {}
                public void onAdRequested(@NonNull CacheEvent event) {}
                public void onAdRequestedToShow(@NonNull ShowEvent event) {}
            }, null);

            FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            );
            params.gravity = Gravity.BOTTOM;
            getActivity().addContentView(chartboostBanner, params);
            chartboostBanner.cache();
            call.resolve();
        });
    }

    private void removeBanner() {
        if (chartboostBanner != null) {
            ViewGroup parent = (ViewGroup) chartboostBanner.getParent();
            if (parent != null) parent.removeView(chartboostBanner);
            chartboostBanner = null;
        }
    }

    @PluginMethod
    public void hideBanner(PluginCall call) {
        getActivity().runOnUiThread(this::removeBanner);
        call.resolve();
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        String location = call.getString("location", "Default");
        getActivity().runOnUiThread(() -> {
            chartboostInterstitial = new Interstitial(location, new InterstitialCallback() {
                public void onAdLoaded(@NonNull CacheEvent event, @Nullable CacheError error) {
                    if (error == null) {
                        chartboostInterstitial.show();
                    } else {
                        Log.e(TAG, "Interstitial cache error: " + error.toString());
                        JSObject ret = new JSObject();
                        ret.put("event", "onAdDisplayFailed");
                        ret.put("message", "Cache failed: " + error.toString());
                        notifyListeners("interstitialEvent", ret);
                    }
                }

                public void onAdShown(@NonNull ShowEvent event, @Nullable ShowError error) {
                    if (error == null) {
                        JSObject ret = new JSObject();
                        ret.put("event", "onAdShown");
                        notifyListeners("interstitialEvent", ret);
                    }
                }

                public void onAdDismiss(@NonNull DismissEvent event) {
                    JSObject ret = new JSObject();
                    ret.put("event", "onAdDismissed");
                    notifyListeners("interstitialEvent", ret);
                }

                public void onAdClicked(@NonNull ClickEvent event, @Nullable ClickError error) {}
                public void onImpressionRecorded(@NonNull ImpressionEvent event) {}
                public void onAdRequested(@NonNull CacheEvent event) {}
                public void onAdRequestedToShow(@NonNull ShowEvent event) {}
            }, null);
            chartboostInterstitial.cache();
            call.resolve();
        });
    }

    @PluginMethod
    public void showRewarded(PluginCall call) {
        String location = call.getString("location", "Default");
        getActivity().runOnUiThread(() -> {
            chartboostRewarded = new Rewarded(location, new RewardedCallback() {
                public void onAdLoaded(@NonNull CacheEvent event, @Nullable CacheError error) {
                    if (error == null) {
                        chartboostRewarded.show();
                    } else {
                        Log.e(TAG, "Rewarded cache error: " + error.toString());
                        call.reject("Rewarded ad failed to load");
                    }
                }

                public void onAdShown(@NonNull ShowEvent event, @Nullable ShowError error) {
                    if (error == null) call.resolve();
                }

                public void onRewardEarned(@NonNull RewardEvent event) {
                    JSObject ret = new JSObject();
                    ret.put("event", "onRewardDerived");
                    notifyListeners("rewardedEvent", ret);
                }

                public void onAdDismiss(@NonNull DismissEvent event) {
                    JSObject ret = new JSObject();
                    ret.put("event", "onAdDismissed");
                    notifyListeners("rewardedEvent", ret);
                }

                public void onAdClicked(@NonNull ClickEvent event, @Nullable ClickError error) {}
                public void onImpressionRecorded(@NonNull ImpressionEvent event) {}
                public void onAdRequested(@NonNull CacheEvent event) {}
                public void onAdRequestedToShow(@NonNull ShowEvent event) {}
            }, null);
            chartboostRewarded.cache();
        });
    }
}