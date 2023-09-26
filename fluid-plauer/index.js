var player = fluidPlayer("video-element", {
  vastOptions: {
    allowVPAID: true,
    adList: [
      {
        roll: "preRoll",
        vastTag: "vast-dfn-vpaid-admon.xml",
      },
    ],

    vastAdvanced: {
      vastLoadedCallback: function () {
        console.log("vastLoadedCallback");
      },
      noVastVideoCallback: function () {
        console.log("noVastVideoCallback");
      },
      vastVideoSkippedCallback: function () {
        console.log("vastVideoSkippedCallback");
      },
      vastVideoEndedCallback: function () {
        console.log("vastVideoEndedCallback");
      },
    },
  },
});
