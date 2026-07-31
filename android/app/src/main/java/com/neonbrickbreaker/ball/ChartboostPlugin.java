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
import com.chartboost.sdk.events.ExpirationEvent;
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

        Log.d(TAG, "Initializing Chartboost with appId: " + appId);

        Chartboost.startWithAppId(getContext(), appId, appSignature, new StartCallback() {
            @Override
            public void onStartCompleted(@Nullable StartError startError) {
                if (startError == null) {
                    Log.d(TAG, "Chartboost initialized successfully");
                    call.resolve();
                } else {
                    Log.e(TAG, "Chartboost init failed: " + startError.getCode().name());
                    call.reject("Chartboost init failed: " + startError.getCode().name());
                }
            }
        });
    }

    @PluginMethod
    public void showBanner(PluginCall call) {
        String location = call.getString("location", "Default");
        Log.d(TAG, "showBanner called with location: " + location);

        getActivity().runOnUiThread(() -> {
            if (chartboostBanner != null) {
                removeBanner();
            }

            chartboostBanner = new Banner(getContext(), location, Banner.BannerSize.STANDARD, new BannerCallback() {
                @Override
                public void onAdLoaded(@NonNull CacheEvent cacheEvent, @Nullable CacheError cacheError) {
                    if (cacheError == null) {
                        Log.d(TAG, "Banner loaded successfully");
                        chartboostBanner.show();
                    } else {
                        Log.e(TAG, "Banner load error: " + cacheError.getCode().name());
                    }
                }

                @Override
                public void onAdRequestedToShow(@NonNull ShowEvent showEvent) {
                    Log.d(TAG, "Banner requested to show");
                }

                @Override
                public void onAdShown(@NonNull ShowEvent showEvent, @Nullable ShowError showError) {
                    if (showError == null) {
                        Log.d(TAG, "Banner shown successfully");
                        JSObject ret = new JSObject();
                        ret.put("event", "onAdShown");
                        notifyListeners("bannerEvent", ret);
                    } else {
                        Log.e(TAG, "Banner show error: " + showError.getCode().name());
                    }
                }

                @Override
                public void onAdClicked(@NonNull ClickEvent clickEvent, @Nullable ClickError clickError) {
                    Log.d(TAG, "Banner clicked");
                }

                @Override
                public void onImpressionRecorded(@NonNull ImpressionEvent impressionEvent) {
                    Log.d(TAG, "Banner impression recorded");
                }

                @Override
                public void onAdExpired(@NonNull ExpirationEvent expirationEvent) {
                    Log.d(TAG, "Banner ad expired");
                }
            }, null);

            FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            );
            params.gravity = Gravity.TOP;
            getActivity().addContentView(chartboostBanner, params);
            chartboostBanner.cache();
            call.resolve();
        });
    }

    private void removeBanner() {
        if (chartboostBanner != null) {
            ViewGroup parent = (ViewGroup) chartboostBanner.getParent();
            if (parent != null) {
                parent.removeView(chartboostBanner);
            }
            chartboostBanner = null;
        }
    }

    @PluginMethod
    public void hideBanner(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            removeBanner();
        });
        call.resolve();
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        String location = call.getString("location", "Default");
        Log.d(TAG, "showInterstitial called with location: " + location);

        getActivity().runOnUiThread(() -> {
            chartboostInterstitial = new Interstitial(location, new InterstitialCallback() {
                @Override
                public void onAdLoaded(@NonNull CacheEvent cacheEvent, @Nullable CacheError cacheError) {
                    if (cacheError == null) {
                        Log.d(TAG, "Interstitial loaded, showing...");
                        chartboostInterstitial.show();
                    } else {
                        Log.e(TAG, "Interstitial load error: " + cacheError.getCode().name());
                        call.reject("Interstitial failed: " + cacheError.getCode().name());
                    }
                }

                @Override
                public void onAdRequestedToShow(@NonNull ShowEvent showEvent) {
                    Log.d(TAG, "Interstitial requested to show");
                }

                @Override
                public void onAdShown(@NonNull ShowEvent showEvent, @Nullable ShowError showError) {
                    if (showError == null) {
                        Log.d(TAG, "Interstitial shown");
                        JSObject ret = new JSObject();
                        ret.put("event", "onAdShown");
                        notifyListeners("interstitialEvent", ret);
                    } else {
                        Log.e(TAG, "Interstitial show error: " + showError.getCode().name());
                    }
                }

                @Override
                public void onAdClicked(@NonNull ClickEvent clickEvent, @Nullable ClickError clickError) {
                    Log.d(TAG, "Interstitial clicked");
                }

                @Override
                public void onImpressionRecorded(@NonNull ImpressionEvent impressionEvent) {
                    Log.d(TAG, "Interstitial impression recorded");
                }

                @Override
                public void onAdDismiss(@NonNull DismissEvent dismissEvent) {
                    Log.d(TAG, "Interstitial dismissed");
                    JSObject ret = new JSObject();
                    ret.put("event", "onAdDismissed");
                    notifyListeners("interstitialEvent", ret);
                }

                @Override
                public void onAdExpired(@NonNull ExpirationEvent expirationEvent) {
                    Log.d(TAG, "Interstitial ad expired");
                }
            }, null);

            chartboostInterstitial.cache();
            call.resolve();
        });
    }

    @PluginMethod
    public void showRewarded(PluginCall call) {
        String location = call.getString("location", "Default");
        Log.d(TAG, "showRewarded called with location: " + location);

        getActivity().runOnUiThread(() -> {
            chartboostRewarded = new Rewarded(location, new RewardedCallback() {
                @Override
                public void onAdLoaded(@NonNull CacheEvent cacheEvent, @Nullable CacheError cacheError) {
                    if (cacheError == null) {
                        Log.d(TAG, "Rewarded loaded, showing...");
                        chartboostRewarded.show();
                    } else {
                        Log.e(TAG, "Rewarded load error: " + cacheError.getCode().name());
                        call.reject("Rewarded failed: " + cacheError.getCode().name());
                    }
                }

                @Override
                public void onAdRequestedToShow(@NonNull ShowEvent showEvent) {
                    Log.d(TAG, "Rewarded requested to show");
                }

                @Override
                public void onAdShown(@NonNull ShowEvent showEvent, @Nullable ShowError showError) {
                    if (showError == null) {
                        Log.d(TAG, "Rewarded shown");
                        call.resolve();
                    } else {
                        Log.e(TAG, "Rewarded show error: " + showError.getCode().name());
                        call.reject("Rewarded show failed: " + showError.getCode().name());
                    }
                }

                @Override
                public void onAdClicked(@NonNull ClickEvent clickEvent, @Nullable ClickError clickError) {
                    Log.d(TAG, "Rewarded clicked");
                }

                @Override
                public void onImpressionRecorded(@NonNull ImpressionEvent impressionEvent) {
                    Log.d(TAG, "Rewarded impression recorded");
                }

                @Override
                public void onRewardEarned(@NonNull RewardEvent rewardEvent) {
                    Log.d(TAG, "Reward earned!");
                    JSObject ret = new JSObject();
                    ret.put("event", "onRewardEarned");
                    notifyListeners("rewardedEvent", ret);
                }

                @Override
                public void onAdDismiss(@NonNull DismissEvent dismissEvent) {
                    Log.d(TAG, "Rewarded dismissed");
                    JSObject ret = new JSObject();
                    ret.put("event", "onAdDismissed");
                    notifyListeners("rewardedEvent", ret);
                }

                @Override
                public void onAdExpired(@NonNull ExpirationEvent expirationEvent) {
                    Log.d(TAG, "Rewarded ad expired");
                }
            }, null);

            chartboostRewarded.cache();
        });
    }
}
