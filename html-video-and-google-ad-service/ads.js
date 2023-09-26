var videoElement;
// Define a variable to track whether there are ads loaded and initially set it to false
var adsLoaded = false;

var adContainer;
var adDisplayContainer;
var adsLoader;
var adsManager;

// On window load, attach an event to the play button click
// that triggers playback on the video element
window.addEventListener("load", function (event) {
  videoElement = document.getElementById("video-element");

  initializeIMA();
  videoElement.addEventListener("play", function (event) {
    loadAds(event);
  });

  var playButton = document.getElementById("play-button");
  playButton.addEventListener("click", function (event) {
    videoElement.play();
  });
});

window.addEventListener("resize", function (event) {
  console.log("window resized");

  if (adsManager) {
    var width = videoElement.clientWidth;
    var height = videoElement.clientHeight;
    adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
  }
});

function initializeIMA() {
  console.log("initializing IMA");
  adContainer = document.getElementById("ad-container");

  adDisplayContainer = new google.ima.AdDisplayContainer(
    adContainer,
    videoElement
  );
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  adsLoader.addEventListener(
    google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
    onAdsManagerLoaded,
    false
  );
  adsLoader.addEventListener(
    google.ima.AdErrorEvent.Type.AD_ERROR,
    onAdError,
    false
  );

  // Let the AdsLoader know when the video has ended
  videoElement.addEventListener("ended", function () {
    adsLoader.contentComplete();
  });

  var adsRequest = new google.ima.AdsRequest();

  adsRequest.adTagUrl = "";

  // Ad response

  adsRequest.adsResponse = `<VAST xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="vast.xsd" version="3.0">
<Ad id="1234567">
<InLine>
<AdSystem>GDFP</AdSystem>
<AdTitle>Linear VPAID Example</AdTitle>
<Description>Vpaid Linear Video Ad</Description>
<Error>http://www.example.com/error</Error>
<Impression>http://www.example.com/impression</Impression>
<Creatives>
<Creative sequence="1">
<Linear>
<Duration>00:00:00</Duration>
<TrackingEvents>
<Tracking event="start">http://www.example.com/start</Tracking>
<Tracking event="firstQuartile">http://www.example.com/firstQuartile</Tracking>
<Tracking event="midpoint">http://www.example.com/midpoint</Tracking>
<Tracking event="thirdQuartile">http://www.example.com/thirdQuartile</Tracking>
<Tracking event="complete">http://www.example.com/complete</Tracking>
<Tracking event="mute">http://www.example.com/mute</Tracking>
<Tracking event="unmute">http://www.example.com/unmute</Tracking>
<Tracking event="rewind">http://www.example.com/rewind</Tracking>
<Tracking event="pause">http://www.example.com/pause</Tracking>
<Tracking event="resume">http://www.example.com/resume</Tracking>
<Tracking event="fullscreen">http://www.example.com/fullscreen</Tracking>
<Tracking event="creativeView">http://www.example.com/creativeView</Tracking>
<Tracking event="acceptInvitation">http://www.example.com/acceptInvitation</Tracking>
</TrackingEvents>
<AdParameters>
<![CDATA[ {"videos":[ {"url":"https://storage.googleapis.com/interactive-media-ads/media/media_linear_VPAID.mp4","mimetype":"video/mp4"}]} ]]>
</AdParameters>
<VideoClicks>
<ClickThrough id="123">http://google.com</ClickThrough>
<ClickTracking id="123">http://www.example.com/click</ClickTracking>
</VideoClicks>
<MediaFiles>
<MediaFile delivery="progressive" apiFramework="VPAID" type="application/javascript" width="640" height="480"> https://googleads.github.io/googleads-ima-html5/vpaid/linear/VpaidVideoAd.js </MediaFile>
</MediaFiles>
</Linear>
</Creative>
</Creatives>
</InLine>
</Ad>
</VAST>`;

  // Specify the linear and nonlinear slot sizes. This helps the SDK to
  // select the correct creative if multiple are returned.
  adsRequest.linearAdSlotWidth = videoElement.clientWidth;
  adsRequest.linearAdSlotHeight = videoElement.clientHeight;
  adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth;
  adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3;

  // Pass the request to the adsLoader to request ads
  adsLoader.requestAds(adsRequest);
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  // Instantiate the AdsManager from the adsLoader response and pass it the video element
  adsManager = adsManagerLoadedEvent.getAdsManager(videoElement);

  adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);

  adsManager.addEventListener(
    google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
    onContentPauseRequested
  );

  adsManager.addEventListener(
    google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
    onContentResumeRequested
  );
}

function onAdError(adErrorEvent) {
  // Handle the error logging.
  console.log(adErrorEvent.getError());
  if (adsManager) {
    adsManager.destroy();
  }
}

function loadAds(event) {
  // Prevent this function from running on if there are already ads loaded
  if (adsLoaded) {
    return;
  }
  adsLoaded = true;

  // Prevent triggering immediate playback when ads are loading
  event.preventDefault();

  console.log("loading ads");

  // Initialize the container. Must be done via a user action on mobile devices.
  videoElement.load();
  adDisplayContainer.initialize();

  var width = videoElement.clientWidth;
  var height = videoElement.clientHeight;
  try {
    adsManager.init(width, height, google.ima.ViewMode.NORMAL);
    adsManager.start();
  } catch (adError) {
    // Play the video without ads, if an error occurs
    console.log("AdsManager could not be started");
    videoElement.play();
  }
}

function onContentPauseRequested() {
  videoElement.pause();
}

function onContentResumeRequested() {
  videoElement.play();
}
