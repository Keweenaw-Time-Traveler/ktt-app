// for different screen size
var imgRoot = 'images';
var bigSize = document.documentElement.clientWidth;
if (window.height > bigSize) bigSize = document.documentElement.clientHeight;
if (bigSize < 1425) {
  imgRoot = 'images_small';
}

var started = false;
var app = [];
app.townManualChanged = false;
app.yearManualChanged = false;
var map;

//Variables for generating a url
app.searchVal = null;
app.x = null;
app.y = null;
app.result = null;
app.section = null;
app.storyid = null;
app.personid = null;
app.urlYears = [];
app.urlRecords = [];
app.urlLocations = [];

// 0 - zoom,navigation
// 1 - spyglass
// 2 - click selection
// 3 - click add new story point
require([
  'dojo/request/xhr',
  'dojo/json',
  'esri/geometry/Point',
  'esri/dijit/Geocoder',
  'dojo/promise/all',
  'esri/map',
  'esri/dijit/Print',
  'esri/tasks/PrintTemplate',
  'esri/tasks/PrintParameters',
  'esri/tasks/PrintTask',
  'esri/config',
  'dojo/io-query',
  'esri/request',
  'esri/dijit/BasemapLayer',
  'esri/basemaps',
  'esri/layers/FeatureLayer',
  'esri/layers/ArcGISDynamicMapServiceLayer',
  'esri/layers/ArcGISTiledMapServiceLayer',
  'esri/dijit/LayerSwipe',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'esri/tasks/locator',
  'esri/dijit/Search',
  'esri/geometry/Extent',
  'esri/graphic',
  'esri/geometry/screenUtils',
  'esri/InfoTemplate',
  'esri/geometry/Geometry',
  'esri/dijit/OpacitySlider',
  'dojo/_base/Color',
  'esri/renderers/SimpleRenderer',
  'esri/symbols/PictureMarkerSymbol',
  'esri/SpatialReference',
  'esri/symbols/SimpleMarkerSymbol',
  'esri/symbols/SimpleLineSymbol',
  'esri/symbols/SimpleFillSymbol',
  'esri/dijit/editing/TemplatePicker',
  'dojo/_base/array',
  'dojo/_base/event',
  'dojo/_base/lang',
  'dojo/parser',
  'dojo/on',
  'dojo/keys',
  'dijit/registry',
  'dojo/dom-style',
  'dojo/dom',
  'dojo/query',
  'dojo/dom-construct',
  'dijit/form/VerticalSlider',
  'dijit/form/VerticalRule',
  'dijit/form/Button',
  'dojo',
  'dijit/layout/BorderContainer',
  'dijit/layout/ContentPane',
  'dijit/layout/AccordionContainer',
  'dijit/DropDownMenu',
  'dijit/MenuItem',
  'dijit/MenuSeparator',
  'dijit/PopupMenuItem',
  'dijit/layout/TabContainer',
  'dijit/Dialog',
  'dojo/dom-prop',
  'dojo/domReady!',
], function (
  xhr,
  JSON,
  Point,
  Geocoder,
  promiseAll,
  Map,
  Print,
  PrintTemplate,
  PrintParameters,
  PrintTask,
  esriConfig,
  dojoIoQuery,
  esriRequest,
  BasemapLayer,
  esriBasemaps,
  FeatureLayer,
  ArcGISDynamicMapServiceLayer,
  ArcGISTiledMapServiceLayer,
  LayerSwipe,
  Query,
  QueryTask,
  Locator,
  Search,
  Extent,
  Graphic,
  screenUtils,
  InfoTemplate,
  esriGeometry,
  OpacitySlider,
  Color,
  SimpleRenderer,
  PictureMarkerSymbol,
  SpatialReference,
  SimpleMarkerSymbol,
  SimpleLineSymbol,
  SimpleFillSymbol,
  TemplatePicker,
  arrayUtils,
  event,
  lang,
  parser,
  dojoOn,
  dojoKeys,
  registry,
  domStyle,
  dojoDom,
  dojoQuery,
  domConstruct,
  VerticalSlider,
  VerticalRule,
  Button,
  dojo
) {
  //!important for the hide/show left pane to work
  parser.parse();
  var tiledMapServiceLayer;
  var swipeWidget;

  // !! important for CORS to work, need to make sure the server side also has CORS enable
  esriConfig.defaults.io.corsEnabledServers.push([domain, port].join(':'));
  app.SpyglassOn = false;

  // loading gif
  var loading = document.getElementById('main-loading');
  esri.show(loading);

  var kettTopoMapLayer = new BasemapLayer({ url: kettTopoMapServerURL });
  esriBasemaps.kettTopoMap = {
    baseMapLayers: [kettTopoMapLayer],
    title: 'kettTopoMap',
  };

  /***
   *Set up buttons and their onclick functions
   * */
  //Apply filters button
  var applyFiltersBtn = document.getElementById('applyFilter');
  applyFiltersBtn.onclick = function () {
    applyFilter(getChecked());
    GetShortDescription();
  };

  //Clear filters button
  var clearFiltersBtn = document.getElementById('clearFilter');
  clearFiltersBtn.onclick = function () {
    clearFilters();
    applyFilter([[], [], []]);
    app.addFilterNumber();
    GetShortDescription();
  };

  //Restore last search button
  var prevSearchBtn = document.getElementById('prevSearchBtn');
  prevSearchBtn.onclick = function () {
    PrepareCleanForSearch();
    app.search.clear();
    app.search.set('value', app.prevSearch);
    SearchFunc(app.prevSearch, true);
  };

  /*******
   * Function to apply an older search
   * ***********/
  function prevSearch() {
    clearFilters(); //Clear filers
    checkFilters(app.prevFilters); //Insert filters for previous search
    applyFilter(getChecked()); //ApplyFilers
    GetShortDescription();
    app.addFilterNumber();
    document.getElementById('prevSearch').hidden = true; //Upon using this the button will disappear
  }

  /*********
   * Function to go through and check buttons that need to be checked
   * @param filtersToCheck, an array of arrays [[years],[records],[locations]]
   * *****************/
  function checkFilters(filtersToCheck) {
    //Check year filters
    if (
      typeof filtersToCheck[0] !== 'undefined' &&
      filtersToCheck[0][0] !== ''
    ) {
      for (var i = 0; i < filtersToCheck[0].length; i++) {
        dojoDom.byId(filtersToCheck[0][i]).checked = true;
      }
    }
    //Check record filters
    if (
      typeof filtersToCheck[1] !== 'undefined' &&
      filtersToCheck[1][0] !== ''
    ) {
      for (var i = 0; i < filtersToCheck[1].length; i++) {
        dojoDom.byId(filtersToCheck[1][i]).checked = true;
      }
    }
    //Check location filters
    if (
      typeof filtersToCheck[2] !== 'undefined' &&
      filtersToCheck[2][0] !== ''
    ) {
      for (var i = 0; i < filtersToCheck[2].length; i++) {
        dojoDom.byId(filtersToCheck[2][i]).checked = true;
      }
    }
  }

  //variable to keep track of searches and put elements on the app as needed
  app.searchPerformed = 0;

  /****************************************************************
   * create the main map with satellite basemap loaded by default
   ***************************************************************/
  map = new Map('map', {
    basemap: 'satellite', //satellite
    //center: [-88.4450987, 47.2355101], // longitude, latitude
    center: [-88.453743, 47.246247], // longitude, latitude
    navigationMode: 'classic',
    sliderPosition: 'top-right',
    sliderStyle: 'small',
    minScale: 200000, // tiled map services won't show up when scale is smaller than this
    maxScale: 200, // tiled map services won't show up when scale is lager than this
    zoom: 14,
  });

  var startExtent = new Extent({
    spatialReference: { wkid: 102100 },
    xmin: -9846895.538152626,
    xmax: -9846429.152847374,
    ymin: 5982318.612841596,
    ymax: 5982577.483558404,
    //"xmin": -9861904.8787,
    //"xmax": -9858430.3063,
    //"ymin":  5961214.051,
    //"ymax":  5963422.7678
  });
  map.setExtent(startExtent);
  var defaultPoint = new Point(-88.453743, 47.246247);
  map.centerAt(defaultPoint);
  app.tiledMapChangeRecenterMap = false;

  // layers-add-result
  map.on('layer-add', function (evt) {
    var layer = evt.layer;
    if (layer.id == 'maplayer') {
      var aEsriGeometry = layer.fullExtent;
      var centerPt = aEsriGeometry.getCenter();
      //if (started) map.centerAt(centerPt);
    }
  });
  //map.on("extent-change", function(evt){
  // dojoDom.byId("scale").innerHTML = "Level: <i>" + evt.lod.level + ":" + map.getScale();
  // });
  map.on('load', function (evt) {
    map.on('click', mapClickHandler);

    // load Topo by default
    var yearUnderSelectObj = document.getElementById('yearUnderSelect');
    yearUnderSelectObj.options[0].selected = true;
    map.setBasemap('satellite');
  });
  started = true;

  app.storyPointLayer = new FeatureLayer(StoryPointURL, {
    definitionExpression: 'flag is null',
  });
  var sPointSymbol = new SimpleMarkerSymbol(
    SimpleMarkerSymbol.STYLE_CIRCLE,
    16,
    new SimpleLineSymbol(
      SimpleLineSymbol.STYLE_SOLID,
      new Color([255, 255, 255]),
      2
    ),
    new Color([208, 83, 237])
  );
  app.storyPointLayer.setRenderer(new SimpleRenderer(sPointSymbol));
  map.addLayer(app.storyPointLayer);
  var storyPointSymbol = new PictureMarkerSymbol(
    'images/pointMarker.png',
    65,
    65
  );

  // to highlight selected polygon
  var redColor = new Color([255, 0, 0, 1]);
  var selectionSymbol = new SimpleFillSymbol(
    SimpleFillSymbol.STYLE_NULL,
    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, redColor, 3),
    redColor
  );
  var pointSymbol = new SimpleMarkerSymbol(
    SimpleMarkerSymbol.STYLE_CIRCLE,
    16,
    new SimpleLineSymbol(
      SimpleLineSymbol.STYLE_NULL,
      new Color([247, 34, 101, 0.9]),
      1
    ),
    new Color([207, 34, 171, 0.5])
  );

  /****************************************************************
   * left pane hide/show
   ***************************************************************/
  var saveLeftPaneWidget = dijit.byId('leftPane');
  var leftPaneOpen = true; //by Default the sidebar is open
  dojo.query('#HideLeftImg').onclick(function (evt) {
    var container = registry.byId('mainBorderContainer');
    var leftPane = dijit.byId('leftPane');
    if (leftPane) {
      container.removeChild(leftPane);
      container.layout();
    }
    domStyle.set(dojo.byId('HideLeftImg'), 'visibility', 'hidden');
    domStyle.set(dojo.byId('ShowLeftImg'), 'visibility', 'visible');
    leftPaneOpen = false;
  });

  dojo.query('#ShowLeftImg').onclick(function (evt) {
    var container = dijit.byId('mainBorderContainer');
    if (container && typeof saveLeftPaneWidget != 'undefined') {
      container.addChild(saveLeftPaneWidget, 0);
      container.layout();
    } else {
    }
    domStyle.set(dojo.byId('ShowLeftImg'), 'visibility', 'hidden');
    domStyle.set(dojo.byId('HideLeftImg'), 'visibility', 'visible');
    leftPaneOpen = true;
  });
  domStyle.set(dojo.byId('ShowLeftImg'), 'visibility', 'hidden');
  domStyle.set(dojo.byId('HideLeftImg'), 'visibility', 'visible');

  /****************************************************************
   * spyglass, opacity
   ***************************************************************/
  dojo.query('#spyglassToggle').onclick(function (evt) {
    var isVisible = domStyle.get('swipeDiv', 'visibility') == 'visible';
    if (isVisible) {
      domStyle.set(dojo.byId('swipeDiv'), 'visibility', 'hidden');
      app.ChangeSelectionMode(2);
    } else {
      domStyle.set(dojo.byId('swipeDiv'), 'visibility', 'visible');
      app.ChangeSelectionMode(1);
    }
    toggleSwipeWidget(!isVisible);
  });

  function toggleSwipeWidget(turnOn) {
    if (turnOn && swipeWidget) {
      swipeWidget.enable();
      var aTd = document.getElementById('layerSwipeTd');
      if (aTd) esri.show(aTd);
      dojo.byId('spyglassToggle').innerHTML = 'Toggle spyglass off';
    } else {
      swipeWidget.disable();
      var aTd = document.getElementById('layerSwipeTd');
      if (aTd) esri.hide(aTd);
      dojo.byId('spyglassToggle').innerHTML = 'Toggle spyglass on';
    }
  }

  /****************************************************************
   * transparency slider
   ***************************************************************/
  var rulesNode = document.createElement('div');
  verticalSliderDiv.appendChild(rulesNode);
  var sliderRules = new VerticalRule(
    {
      count: 10,
      style: 'width:5px;',
    },
    rulesNode
  ).startup();
  var slider = new VerticalSlider(
    {
      name: 'verticalSliderDiv',
      value: 100,
      minimum: 1,
      maximum: 100,
      intermediateChanges: true,
      style: 'height:300px;',
      onChange: function (value) {
        var opacity = value / 100;
        if (tiledMapServiceLayer) tiledMapServiceLayer.setOpacity(opacity);
        dojo.byId('tranSliderDiv').innerHTML = 'Opacity: ' + value.toFixed(0);

        //toggleSwipeWidget(value>80);
      },
    },
    'verticalSliderDiv'
  ).startup();

  if (window.location.hash != undefined) {
    map.on('load', facebookLinkHandle); // Wait for map then try to go to the facebook link
  }

  /****************************************************************
   * switch the main tiled map service
   ***************************************************************/
  function SwitchMainTiledMapService() {
    let mapServiceURL = null;
    // remove current layers
    var maplayer = map.getLayer('maplayer');
    if (maplayer) map.removeLayer(maplayer);

    //request made to tiled map service. If the requested year is not in the validserviceconfig.year list, fallback to dynamic below.
    if (kettAllInOneByYears.indexOf(validServiceConfig.year) > -1) {
      if (validServiceConfig.year == 1949) {
        mapServiceUrl = kettAllInOneByYearPattern.replace(
          'YYYY',
          validServiceConfig.year + '3'
        );
      } else {
        mapServiceUrl = kettAllInOneByYearPattern.replace(
          'YYYY',
          validServiceConfig.year
        );
      }
      tiledMapServiceLayer = new ArcGISTiledMapServiceLayer(mapServiceUrl, {
        id: 'maplayer',
        opacity: 1,
      });
    } else {
      // this must be ArcGISDynamicMapServiceLayer, otherwise the spyglass does not work
      // this is the fallback if there is not a tile cache built for the requested year
      tiledMapServiceLayer = new ArcGISDynamicMapServiceLayer(mapServiceUrl, {
        id: 'maplayer',
        opacity: 1,
      });
    }

    map.addLayer(tiledMapServiceLayer);
    //map.setLevel(17);

    tiledMapServiceLayer.on('load', function (error) {
      //tiledMapServiceLayer.on("update-end",function(error){
      if (app.MapCenterAt) {
        if (!app.townManualChanged && app.yearManualChanged) {
          //the map should not re-center
        } else {
          map.centerAt(app.MapCenterAt);
        }
      }
      if (validServiceConfig) {
        dojoDom.byId('yearTopDiv').innerHTML =
          validServiceConfig.name + ' ' + validServiceConfig.year;
      }

      if (swipeWidget) {
        // "vertical", "horizontal" or "scope"
        swipeWidget.set('type', 'scope');
        swipeWidget.set('map', map);
        swipeWidget.set('layers', [tiledMapServiceLayer]);
        swipeWidget.startup();
      } else {
        swipeWidget = new LayerSwipe(
          {
            type: 'scope',
            map: map,
            layers: [tiledMapServiceLayer],
            toolOffsetLeft: 10,
          },
          'swipeDiv'
        );
        swipeWidget.startup();
      }
      // set spyglass disabled
      domStyle.set(dojo.byId('swipeDiv'), 'visibility', 'hidden');
      toggleSwipeWidget(false);

      //app.CenterAtTownCentroid(validServiceConfig.name);
      //alert(app.townManualChanged + " ," + app.yearManualChanged);
      if (!app.townManualChanged && app.yearManualChanged) {
        //the map should not re-center
      } else {
        app.CenterAtTownCentroid(validServiceConfig.name);
      }

      app.townManualChanged = false;
      app.yearManualChanged = false;
    });
    tiledMapServiceLayer.on('error', function (error) {
      alert('There is a problem with loading:' + mapservice);
    });
  }

  /****************************************************************
   * populate location list from configuration file
   ***************************************************************/
  function locationItemExists(tvalue) {
    var lSel = document.getElementById('locationSelect');
    for (var i = lSel.length - 1; i >= 0; i--) {
      if (lSel.options[i].value == tvalue) {
        return true;
      }
    }
    return false;
  }

  function populateLocations() {
    var locationOptionObj = document.getElementById('locationSelect');
    var opt = document.createElement('option');
    opt.value = '';
    opt.innerHTML = 'select a location';
    locationOptionObj.appendChild(opt);

    for (var i = 0; i < kht.Services.length; i++) {
      if (locationItemExists(kht.Services[i].value)) continue;
      var opt = document.createElement('option');
      opt.value = kht.Services[i].value;
      opt.innerHTML = kht.Services[i].name;
      locationOptionObj.appendChild(opt);
    }

    var selectIndex = 0;
    for (var i = 0; i < locationOptionObj.length; i++) {
      if (locationOptionObj.options[i].value == validServiceConfig.value) {
        selectIndex = i;
        break;
      }
    }
    // to handle the passed location, year
    locationOptionObj.selectedIndex = selectIndex;
    if (validServiceConfig && selectIndex > 0) {
      resetYearSelectionList(validServiceConfig.value);
    }
  }

  /****************************************************************
   * Refresh year list based on place name feature services
   * when the user chooses a location from the list
   ***************************************************************/
  dojo.query('#locationSelect').onchange(function (evt) {
    if (evt.target.value) {
      var locationValue = evt.target.value;
      app.MapCenterAt = null;
      app.townManualChanged = true;
      app.tiledMapChangeRecenterMap = true;
      resetYearSelectionList(locationValue);
    } else {
      //alert("invalid value!");
    }
    dojo.stopEvent(evt);
  });

  function resetYearSelectionList(locationValue) {
    var yearOptionObj = document.getElementById('yearSelect');
    for (var i = yearOptionObj.options.length - 1; i >= 0; i--) {
      yearOptionObj.remove(i);
    }

    var opt = document.createElement('option');
    opt.value = '';
    opt.innerHTML = 'select a year';
    yearOptionObj.appendChild(opt);

    //town name with space
    var locationName = locationValue;
    for (var i = 0; i < kht.Services.length; i++) {
      if (Equals(kht.Services[i].value, locationValue)) {
        locationName = kht.Services[i].name;
        break;
      }
    }

    var queryYearTask = new QueryTask(placeNameURL);
    var queryYear = new Query();
    queryYear.returnGeometry = false;
    queryYear.outFields = ['*']; //["objectid", "id", "region_nam", "years_csv", "years_color"];
    queryYear.where = "upper(region_nam) ='" + locationName.toUpperCase() + "'"; //Houghton'";
    queryYearTask.execute(
      queryYear,
      function (results) {
        var resultCount = results.features.length;
        var yearField = 'years_cache';
        //this should be only one record for each town
        var index = 0;
        var featureAttributes = results.features[0].attributes;
        var yearItems = featureAttributes[yearField].split(',');
        var opt = document.createElement('option');
        for (var i = 0; i < yearItems.length; i++) {
          var opt = document.createElement('option');
          opt.value = yearItems[i];
          opt.innerHTML = yearItems[i];
          yearOptionObj.appendChild(opt);

          if (validServiceConfig) {
            if (validServiceConfig.year == yearItems[i]) {
              index = i + 1;
            }
          }
        }
        // to handle the passed location, year
        yearOptionObj.options[index].selected = true;
        if (validServiceConfig && index > 0) {
          //SwitchMainTiledMapService(validServiceConfig.mapservice);

          var town_year =
            locationValue + '_' + yearOptionObj.options[index].value;
          for (var i = 0; i < kht.Services.length; i++) {
            if (town_year == kht.Services[i].id) {
              if (
                kht.Services[i].name &&
                kht.Services[i].year &&
                kht.Services[i].mapservice
              ) {
                validServiceConfig = kht.Services[i];
                SwitchMainTiledMapService(validServiceConfig.mapservice);
                break;
              }
            }
          }
        }
      },
      function (err) {
        alert(err);
      }
    );
  }

  /****************************************************************
   * Reset the tiled map when the user chooses a year
   ***************************************************************/
  dojo.query('#yearSelect').onchange(function (evt) {
    //console.log(evt.target.value)
    if (evt.target.value) {
      var locationOpt = document.getElementById('locationSelect');
      var year = evt.target;
      //console.log(year.value);
      if (locationOpt.value.length > 0 && year.value.length > 0) {
        var town_year = locationOpt.value + '_' + year.value;
        for (var i = 0; i < kht.Services.length; i++) {
          if (town_year == kht.Services[i].id) {
            if (
              kht.Services[i].name &&
              kht.Services[i].year &&
              kht.Services[i].mapservice
            ) {
              validServiceConfig = kht.Services[i];
              app.yearManualChanged = true;
              SwitchMainTiledMapService(kht.Services[i].mapservice);
              break;
            }
          }
        }
      }
    } else {
      //alert("invalid value!");
    }
    dojo.stopEvent(evt);
  });

  /****************************************************************
   * set the underlay tiled map when the user chooses an underlay
   ***************************************************************/

  dojo.query('#yearUnderSelect').onchange(function (evt) {
    if (evt.target.value) {
      if (evt.target.value == 'ESRI Satellite') {
        map.setBasemap('satellite');
        //map.setExtent(startExtent);
      } else {
        map.setBasemap('kettTopoMap');
        //map.setExtent(startExtent);
      }
    } else {
      alert('invalid value!');
    }
    dojo.stopEvent(evt);
  });

  /**************************************************************
   * reset tiled map after a search
   ***************************************************************/
  function ResetTileMapFromSearchResult(placename, attrYear, searchType) {
    app.tiledMapChangeRecenterMap = false;
    app.mapYear = attrYear;
    app.mapLoc = placename;
    var hasTiledMapService = false;
    if (searchType == 'story1') {
      if (!attrYear) {
        var selyr = document.getElementById('yearSelect');
        attrYear = selyr.options[selyr.selectedIndex].value;
      }

      //console.log(placename);
      var newServiceConfig = app.GetDecadeBinTiledServiceURL(
        placename,
        attrYear
      );
      //console.log(newServiceConfig);
      if (newServiceConfig == '') return;
      if (
        validServiceConfig.name == newServiceConfig.name &&
        validServiceConfig.year == newServiceConfig.year
      )
        return;
      placename = newServiceConfig.name;
      validServiceConfig = newServiceConfig;
      hasTiledMapService = true;
    } else {
      //alert(placename + " " + attrYear);
      //console.log(validServiceConfig);
      if (
        validServiceConfig.name == placename &&
        validServiceConfig.year == attrYear
      )
        return;
      for (var i = 0; i < kht.Services.length; i++) {
        if (
          kht.Services[i].name == placename &&
          kht.Services[i].year == attrYear
        ) {
          validServiceConfig = kht.Services[i];
          hasTiledMapService = true;
          writeLog('get:' + placename + ',' + attrYear);
          dojoDom.byId('yearTopDiv').innerHTML = ''; //validServiceConfig.name + " " + validServiceConfig.year;
          break;
        }
      }
    }
    if (hasTiledMapService == false) {
      writeLog(
        'Tiled map [' + placename + ',' + attrYear + ']is not available!'
      );
      return;
    }

    var locationOptionObj = document.getElementById('locationSelect');
    for (var i = 0; i < locationOptionObj.options.length; i++) {
      writeLog(locationOptionObj.options[i].innerHTML + '-' + placename);
      if (locationOptionObj.options[i].innerHTML == placename) {
        locationOptionObj.selectedIndex = i;
        resetYearSelectionList(validServiceConfig.value);
        writeLog('resetYearSelectionList:' + validServiceConfig.name);
        break;
      }
    }
    app.townManualChanged = false;
  }

  /****************************************************************
   * 0. select on the map from feature service directly
   *     .../KeweenawHSDI/cchsdi_bldgs_forapps/MapServer/0
   *     .../KeweenawHSDI/cchsdi_placenames/MapServer/0
   ***************************************************************/
  // query task and query for polygon feature
  app.polygonFCQueryTask = new QueryTask(khtFSURL);
  app.polygonFCQuery = new Query();
  app.polygonFCQuery.returnGeometry = true;
  app.polygonFCQuery.outFields = ['*'];
  app.polygonFCQuery.num = 1;

  //query task and query for people
  app.peopleFCQueryTask = new QueryTask(peopleURL);
  app.peopleFCQuery = new Query();
  app.peopleFCQuery.returnGeometry = true;
  app.peopleFCQuery.outFields = ['*'];

  // query task and query for placename
  app.placeNameFCQueryTask = new QueryTask(placeNameURL);
  app.placeNameFCQuery = new Query();
  app.placeNameFCQuery.returnGeometry = true;
  app.placeNameFCQuery.outFields = ['*'];

  // query task and query for story point
  app.storyPointFCQueryTask = new QueryTask(StoryPointURL);
  app.storyPointFCQuery = new Query();
  app.storyPointFCQuery.returnGeometry = true;
  app.storyPointFCQuery.outFields = ['*'];

  function mapClickHandler(evt) {
    // 0 - zoom,navigation
    // 1 - spyglass
    // 2 - click selection
    // 3 - click add new story point
    app.newStoryPoint = null;
    if (app.SelectionMode == 0) {
      // zoom, navigation
      return;
    } else if (app.SelectionMode == 1) {
      // spyglass
      return;
    } else if (app.SelectionMode == 2) {
      // click selection
    } else if (app.SelectionMode == 3) {
      // add new story point
      var newPointMarker = new Graphic(evt.mapPoint, storyPointSymbol);
      //console.log(map);
      app.newStoryPoint = evt.mapPoint;
      map.graphics.add(newPointMarker);

      // Fill the sidebar with the new point form
      $('#popupContent').html($('#newPointPopup').html());

      // Show the sidebar
      $('#pointPopup').modal('show');

      // Setup image upload fields
      $('#pointPopup')
        .find('#imageinput1')
        .change(function () {
          $('#pointPopup').find('#imageinput2').fadeIn();
        });
      $('#pointPopup')
        .find('#imageinput2')
        .change(function () {
          $('#pointPopup').find('#imageinput3').fadeIn();
        });
      return;
    }

    //Reopens leftPanel if closed
    if (leftPaneOpen == false) {
      var container = dijit.byId('mainBorderContainer');
      if (container && typeof saveLeftPaneWidget != 'undefined') {
        container.addChild(saveLeftPaneWidget, 0);
        container.layout();
      } else {
      }
      domStyle.set(dojo.byId('ShowLeftImg'), 'visibility', 'hidden');
      domStyle.set(dojo.byId('HideLeftImg'), 'visibility', 'visible');
      leftPaneOpen = true;
    }
    PrepareCleanForSearch();

    //console.log(evt);

    //close any open modal that may be open when map is clicked on
    var storyModal = document.getElementById('storyModal');
    storyModal.style.display = 'none';
    var infoModal = document.getElementById('infoModal');
    infoModal.style.display = 'none';

    //Get the x&y values
    app.x = evt.mapPoint.x;
    app.y = evt.mapPoint.y;
    app.mapLoc = validServiceConfig.name;
    app.mapYear = validServiceConfig.year;
    app.searchVal = null;
    app.urlYears = [];
    app.urlRecords = [];
    app.urlLocations = [];
    app.storyid = null;

    var pxWidth = map.extent.getWidth() / map.width;
    var padding = 3 * pxWidth;
    var queryGeom = new Extent({
      xmin: evt.mapPoint.x - padding,
      ymin: evt.mapPoint.y - padding,
      xmax: evt.mapPoint.x + padding,
      ymax: evt.mapPoint.y + padding,
      spatialReference: evt.mapPoint.spatialReference,
    });
    //console.log(queryGeom);
    //use the extent for the query geometry
    app.polygonFCQuery.geometry = queryGeom;
    //app.polygonFCQuery.where = " place_nam='" + validServiceConfig.name + "'";
    //app.polygonFCQuery.where += " and year=" + validServiceConfig.year;
    app.polygonFCQuery.where = ' year=' + validServiceConfig.year;

    app.placeNameFCQuery.geometry = queryGeom;
    app.placeNameFCQuery.where =
      " region_nam='" + validServiceConfig.name + "'";
    app.placeNameFCQuery.where +=
      " and years_csv like '%" + validServiceConfig.year + "%'";

    app.storyPointFCQuery.geometry = queryGeom;
    app.storyPointFCQuery.where = ' flag is null';

    // console.log(app.polygonFCQuery);
    // console.log(map);
    var polygonResults = app.polygonFCQueryTask.execute(app.polygonFCQuery);
    var placeNameResults = app.placeNameFCQueryTask.execute(
      app.placeNameFCQuery
    );
    var storyPointResults = app.storyPointFCQueryTask.execute(
      app.storyPointFCQuery
    );

    //console.log("deferreds: ", polygonResults, placeNameResults, storyPointResults);

    //Clear Filters and update the counts
    app.prevFilters = getChecked(); //Updates prevFilters
    clearFilters();
    app.searchVal = null; //Resets search value for generating url's
    app.urlYears = [];
    app.urlRecords = [];
    app.urlLocations = [];
    app.peopleSearchResultJson = [];
    app.placeSearchResultJson = [];
    app.buildingSearchResultJson = [];
    app.storySearchResultJson = [];
    app.addFilterNumber(); //Resets the filter numbers(ie available records)
    //Clear search bar
    app.search.clear();
    //Add Restore last search button if needed(ie A search was performed prior to clicking the map. If not then the button will not be added)
    if (app.searchPerformed > 0) {
      dojoDom.byId('prevSearch').hidden = false;
      app.prevSearch = app.curSearch; //Updates prevSearch
    }

    promises = promiseAll([
      polygonResults,
      placeNameResults,
      storyPointResults,
    ]);
    promises.then(handleMapClickQueryResults);
    //console.log("createdd list");
  }

  function handleMapClickQueryResults(results) {
    //console.log("queries finished: ", results);
    var polygonFeats, placeNamePoints;

    // make sure both queries finished successfully
    if (!results[0].hasOwnProperty('features')) {
      console.log('Parcels query failed.');
    }
    if (!results[1].hasOwnProperty('features')) {
      console.log('Buildings query failed.');
    }
    if (!results[2].hasOwnProperty('features')) {
      console.log('storypoint query failed.');
    }
    polygonFeats = results[0].features;
    placeNamePoints = results[1].features;
    storyPoints = results[2].features;
    map.graphics.clear();

    // add the results to the map
    var shorDescHTML = '';
    arrayUtils.forEach(polygonFeats, function (feat) {
      feat.setSymbol(selectionSymbol);
      map.graphics.add(feat);
      if (feat.attributes['join_id']) {
        shorDescHTML += '<button>';
        shorDescHTML += feat.attributes['join_id'] + ',';
        shorDescHTML += feat.attributes['place_nam'] + ',';
        shorDescHTML += feat.attributes['year'];
        shorDescHTML += '</button>';
        phpByIdSearch(
          feat.attributes['join_id'],
          feat.attributes['place_nam'],
          feat.attributes['year']
        );
      }
    });

    arrayUtils.forEach(placeNamePoints, function (feat) {
      feat.setSymbol(
        new SimpleFillSymbol()
          .setColor(new Color([255, 0, 255, 0.5]))
          .setOutline(null)
      );
      //map.graphics.add(feat);
      //dojoDom.byId("messageDiv").innerHTML = "placenames: " + feat.attributes['region_nam'];
    });

    arrayUtils.forEach(storyPoints, function (feat) {
      //console.log("storyPoints");
      clearFilters();
      app.searchVal = null;
      app.urlYears = [];
      app.urlRecords = [];
      app.urlLocations = [];
      app.result = null;
      app.section = null;

      app.storyid = feat.attributes['objectid'];
      feat.setSymbol(storyPointSymbol);
      map.graphics.add(feat);
      app.storyHolder = feat.attributes; //Puts into story holder for if story is shared
      StoryImageSidePane(feat.attributes['objectid']);

      // Change the year to the year of the point
      if (feat.attributes['mapyear'] != null) {
        $('#yearSelect').val(feat.attributes['mapyear']);

        var locationOpt = document.getElementById('locationSelect');
        var year = feat.attributes['mapyear'];
        if (locationOpt.value.length > 0) {
          var town_year = locationOpt.value + '_' + year;
          for (var i = 0; i < kht.Services.length; i++) {
            if (town_year == kht.Services[i].id) {
              if (
                kht.Services[i].name &&
                kht.Services[i].year &&
                kht.Services[i].mapservice
              ) {
                validServiceConfig = kht.Services[i];
                app.yearManualChanged = true;
                //alert(app.townManualChanged);
                SwitchMainTiledMapService(kht.Services[i].mapservice);
                break;
              }
            }
          }
        }
      }
    });

    //dojoDom.byId("messageDiv").innerHTML = "Number of polygons:  " +  polygonFeats.length;
    //dojoDom.byId("searchResultDetails").innerHTML += "<br/>Number of placenames:  " + placeNamePoints.length;

    //app.ChangeSelectionMode(0);
  }

  function phpByIdSearch(joinId, townName, yearValue) {
    // http://gis-core.sabu.mtu.edu/search_by_id.php?town=hancock&year=1949&jid=4115

    registry.byId('BldgPane').set('title', 'Bldgs(0)');
    registry.byId('PeoplePane').set('title', 'People(0)');
    //registry.byId("PlacePane").set('title',"Place(0)");
    registry.byId('StoryPane').set('title', 'Story(0)');

    dojoDom.byId('searchResultBldgs').innerHTML = '';
    dojoDom.byId('searchResultPeople').innerHTML = '';
    //dojoDom.byId("searchResultPlace").innerHTML = "";
    dojoDom.byId('searchResultStory').innerHTML = '';
    dojoDom.byId('searchResultDetails').innerHTML = '';
    dojoDom.byId('photoPlaceHolder').innerHTML = '';
    dojoDom.byId('messageDiv').innerHTML = '';

    app.peopleResultJson = null;
    app.placeResultJson = null;
    app.storyResultJson = null;
    app.buildingResultJson = null;

    app.peopleSearchResultJson = null;
    app.placeSearchResultJson = null;
    app.storySearchResultJson = null;
    app.buildingSearchResultJson = null;

    var url = IdTestUrl;
    xhr(url, {
      handleAs: 'json',
      headers: { 'X-Requested-With': null },
      query: { town: townName, year: yearValue, jid: joinId },
    }).then(
      function (data) {
        // console.log(data.person);
        // console.log(data.place);
        // console.log(data.bldg);
        // console.log(data.story);
        var results = data.results;
        writeLog(JSON.stringify(results));

        app.peopleResultJson = results.people;
        app.placeResultJson = results.places;
        app.buildingResultJson = results.buildings;
        app.storyResultJson = results.stories;

        app.peopleSearchResultJson = results.people;
        app.placeSearchResultJson = results.places;
        app.buildingSearchResultJson = results.buildings;
        app.storySearchResultJson = results.stories;

        GetShortDescription();

        if (app.load == 0) {
          //console.log(app.load);
          var url = new URL(window.location.href);
          var section = url.searchParams.get('rs');
          var index = url.searchParams.get('r');
          loadGivenResult(section, index);
          switch (section) {
            case 'bldg':
              openPane(1); //open corresponding pane
              app.selected(1, index); //indicate selected item
              break;
            case 'place':
              openPane(2);
              app.selected(2, index);
              break;
            case 'people':
              openPane(3);
              app.selected(3, index);
              break;
            case 'story':
              openPane(4);
              app.selected(4, index);
              break;
          }
          app.load += 1;
        }

        dojoDom.byId('messageDiv').innerHTML =
          'Select a result below (Please note that places are currently only from 1917)';
      },
      function (error) {
        alert(error);
      }
    );
  }

  app.ChangeSelectionMode = function (modeInt) {
    // 0 - zoom,navigation
    // 1 - spyglass
    // 2 - click selection
    // 3 - click add new story point
    map.setMapCursor('default');
    app.SelectionMode = modeInt;
    if (app.SelectionMode == 2) {
      $('#selectionMode').hide();
      dojoDom.byId('selectionMode').innerHTML = ''; //"Click on the map to select building";
      dojoDom.byId('pointShareTip').innerHTML = '';
      domStyle.set(dojo.byId('pointShareTip'), 'visibility', 'hidden');
    } else if (app.SelectionMode == 3) {
      // dojoDom.byId("selectionMode").innerHTML = "click a point on the map to locate your story";
      // $('#selectionMode').show();
      dojoDom.byId('pointShareTip').innerHTML =
        'Click a point on the map to locate your story.';
      domStyle.set(dojo.byId('pointShareTip'), 'visibility', 'visible');
      $('#pointShareTip').show();
      map.setMapCursor('crosshair');
    } else {
      dojoDom.byId('selectionMode').innerHTML = '';
      dojoDom.byId('pointShareTip').innerHTML = '';
      domStyle.set(dojo.byId('pointShareTip'), 'visibility', 'hidden');
    }

    if (app.SelectionMode != 3) {
      dojoDom.byId('pointShareTip').innerHTML = '';
      domStyle.set(dojo.byId('pointShareTip'), 'visibility', 'hidden');
    }
  };
  /****************************************************************
   * 1.search address - Geocoding service(s)
   ***************************************************************/
  const searchExtentEsriGeocoder = new Extent({
    xmin: -9948179.119472,
    ymin: 5836072.653278,
    xmax: -9720595.189964,
    ymax: 6158168.181419,
    spatialReference: { wkid: 102100 },
  });

  app.search = new Search(
    {
      enableLabel: false,
      enableInfoWindow: true,
      showInfoWindowOnSelect: false,
      //includeDefaultSources: false,
      autoNavigate: false,
      allPlaceholder: 'Search by address or term',
      map: map,
    },
    'search'
  );
  app.search.on('load', function () {
    var sources = app.search.sources;
    for (let i = 0; i < KeTT_Geocoders.length; i++) {
      sources.push({
        locator: new Locator(
          GeocoderRootUrl + KeTT_Geocoders[i] + '/GeocodeServer/'
        ),
        singleLineFieldName: 'Single Line Input ',
        outFields: ['*'],
        name: KeTT_Geocoders[i].split('_')[2].replace('190708', '1908'),
        placeholder: '1 2nd , Calumet',
        maxResults: 3,
        maxSuggestions: 3,
        exactMatch: true,
        enableSuggestions: true,
        enableSearchingAll: true,
        autoComplete: true,
        minCharacters: 0,
      });
    }
    app.search.set('sources', sources);
  });
  app.search.sources[0].searchExtent = searchExtentEsriGeocoder;
  app.search.sources[0].enableSuggestions = true;
  app.search.sources[0].exactMatch = true;
  app.search.sources[0].maxSuggestions = 3;
  app.search.sources[0].highlightSymbol = null; //Remove default point marker
  app.search.startup(); //to start the widget
  //console.log(app.search);
  app.prevSearch = '';
  app.prevFilters = [[], [], []];
  app.curChecked = [[], [], []];

  app.search.on('select-result', function (e) {
    // console.log(e);
    // console.log(app.search.value);
    //Check to see if the search is an actual address, if so show location.
    let searchVal = app.search.value;
    let format = searchVal.includes(',');
    let hasTown =
      searchVal.includes('Houghton') ||
      searchVal.includes('Lake Linden') ||
      searchVal.includes('Calumet') ||
      searchVal.includes('Atlantic Mine') ||
      searchVal.includes('Dollar Bay') ||
      searchVal.includes('Hancock') ||
      searchVal.includes('Laurium') ||
      searchVal.includes('Mohawk') ||
      searchVal.includes('Quincy') ||
      searchVal.includes('South Houghton County') ||
      searchVal.includes('South Range');
    let hasNum =
      searchVal.includes('0') ||
      searchVal.includes('1') ||
      searchVal.includes('2') ||
      searchVal.includes('3') ||
      searchVal.includes('4') ||
      searchVal.includes('5') ||
      searchVal.includes('6') ||
      searchVal.includes('7') ||
      searchVal.includes('8') ||
      searchVal.includes('9');
    //console.log(format, hasTown, hasNum);
    if (format && hasTown && hasNum) {
      showGeocodedLocation(e);
    }
  });

  app.search.on('search-results', function (e) {
    PrepareCleanForSearch();
    //showGeocodedLocation(e);
    //console.log(e);
    app.prevSearch = app.curSearch; //Get value before it is updated with the newest search term
    //console.log(app.prevSearch);
    app.prevFilters = getChecked(); //Updates previous fiters for recall latest
    clearFilters(); //Clears filters
    SearchFunc(app.search.value, false); //performs the search
  });
  app.search.on('clear-search', function () {
    map.graphics.clear();
  });

  function showGeocodedLocation(e) {
    //PrepareCleanForSearch();
    //console.log(e);

    var point = e.result.feature.geometry;
    var matchAddr = e.result.feature.attributes['Match_addr'];
    //   dojoDom.byId("messageDiv").innerHTML = matchAddr;

    var newPointSymbol = new PictureMarkerSymbol(
      'images/pointMarker.png',
      65,
      65
    );
    var newPointMarker = new Graphic(point, newPointSymbol);
    map.graphics.add(newPointMarker);
    app.MapCenterAt = point;

    writeLog(JSON.stringify(point.toJson()));

    if (e.source.name == 'Esri World Geocoder') {
      map.centerAt(app.MapCenterAt);
      return;
    }

    // for historical geocoder
    var geoSource = e.source;
    if (geoSource) {
      // 195 Quincy , Houghton
      var geoTown = matchAddr.split(',')[1];

      // KeTT_Geocoder_1900
      var geoYear = geoSource.name; //geoSource.name.split('_')[2];
      writeLog(geoSource.name + ':' + geoTown.trim() + ',' + geoYear);

      // Find Polygon that intersected with the Point
      var queryTask = new QueryTask(khtFSURL);
      var query = new Query();
      query.outFields = ['*'];
      query.geometry = point;
      //query.where = "year=1900 and place_nam='Houghton'";
      //we'd edit code below to remove place_nam and just use year and the geometry item above
      query.where =
        "place_nam like '%" + geoTown.trim() + "%' and year=" + geoYear;
      query.returnGeometry = true;
      queryTask.execute(
        query,
        function (results) {
          writeLog(results.features.length);
          if (results && results.features.length > 0) {
            var resultCount = results.features.length;
            for (var i = 0; i < resultCount; i++) {
              var curFeature = results.features[i];
              var placename = curFeature.attributes['place_nam'];
              var attrYear = curFeature.attributes['year'];
              var joinId = curFeature.attributes['join_id'];
              var polygon = curFeature.geometry;
              map.graphics.clear();
              map.graphics.add(new Graphic(polygon, selectionSymbol));
              var centerPt = polygon.getCentroid();
              map.centerAt(centerPt);
              app.MapCenterAt = centerPt;

              // switch tiled map service
              ResetTileMapFromSearchResult(placename, attrYear);

              // redefine point FS layer definition filter
              ResetStoryPointDefinitionFilter(placename, attrYear);

              // search by id with joinid+town+year
              if (joinId)
                phpByJoinId_GeocodedPoint(joinId, placename, attrYear);
            }
          }
        },
        function (error) {
          writeLog('geocoded point intersects polygon:' + error.message);
        }
      );
    }
  }

  function phpByJoinId_GeocodedPoint(joinId, townName, yearValue) {
    // http://gis-core.sabu.mtu.edu/search_by_id.php?town=hancock&year=1949&jid=4115

    //map.graphics.clear();
    registry.byId('BldgPane').set('title', 'Buildings(0)');
    registry.byId('PeoplePane').set('title', 'People(0)');
    //registry.byId("PlacePane").set('title',"Place(0)");
    registry.byId('StoryPane').set('title', 'Story(0)');
    dojoDom.byId('searchResultBldgs').innerHTML = '';
    dojoDom.byId('searchResultPeople').innerHTML = '';
    dojoDom.byId('searchResultPlace').innerHTML = '';
    dojoDom.byId('searchResultStory').innerHTML = '';
    dojoDom.byId('searchResultDetails').innerHTML = '';
    dojoDom.byId('photoPlaceHolder').innerHTML = '';

    app.peopleResultJson = null;
    app.placeResultJson = null;
    app.storyResultJson = null;
    app.buildingResultJson = null;

    app.peopleSearchResultJson = null;
    app.placeSearchResultJson = null;
    app.storySearchResultJson = null;
    app.buildingSearchResultJson = null;

    var url = phpSearchByIdURL;
    xhr(url, {
      handleAs: 'json',
      headers: { 'X-Requested-With': null },
      query: { town: townName, year: yearValue, jid: joinId },
    }).then(
      function (data) {
        //console.log(data.results);
        var results = data.results;
        //writeLog (JSON.stringify(results));

        app.peopleResultJson = results.people;
        app.placeResultJson = results.places;
        app.buildingResultJson = results.buildings;
        app.storyResultJson = results.stories;

        app.peopleSearchResultJson = results.people;
        app.placeSearchResultJson = results.places;
        app.buildingSearchResultJson = results.buildings;
        app.storySearchResultJson = results.stories;
        GetShortDescription();
      },
      function (error) {
        alert(error);
      }
    );
  }

  app.RetrieveBldgDetails = function (bldgIndex) {
    var building = app.buildingResultJson[bldgIndex].building;

    ResetTileMapFromSearchResult(building.town, building.year);

    ResetStoryPointDefinitionFilter(building.town, building.year);

    if (building.join_id > 0) {
      JYT_Query_Building(building.join_id, building.town, building.year);
    }

    // returned from PHP
    var resultHTML = '<span id = "modalClose" class="close">&times;</span>';
    resultHTML += "<table class ='searchResultTable'>";
    resultHTML += '<tr>';
    resultHTML += '<th colspan=2>' + building.short_descr + '</td>';
    resultHTML += '</tr>';

    var displayMap = {
      year: 'Year',
      address: 'Address',
      num_stories: '# of Stories',
      building_materials: 'Building Material',
      basement: 'Has Basement',
      bldg_type: 'Building Use',
      bldg_function: 'Building Function',
      bldg_occupation: 'Occupant',
      textnote: 'Note',
    };

    var materialsMap = {
      GRAY: 'IRON',
      YELLOW: 'WOOD',
      PINK: 'BRICK',
      BLUE: 'STONE',
      GREEN: 'SPECIAL',
    };

    // ========
    for (var key in displayMap) {
      if (building.hasOwnProperty(key) && displayMap.hasOwnProperty(key)) {
        resultHTML += '<tr>';
        if (key == 'building_materials') {
          let materialString = '';
          let materials = building[key].split(' ');
          for (let i = 0; i < materials.length; i++) {
            if (materialsMap.hasOwnProperty(materials[i])) {
              materials[i] = materialsMap[materials[i]];
            }
            materialString += materials[i] + ' ';
          }
          resultHTML += '<td>' + displayMap[key] + '</td>';
          resultHTML += '<td>' + materialString + '</td>';
          resultHTML += '</tr>';
        } else {
          resultHTML += '<td>' + displayMap[key] + '</td>';
          let keyVal =
            building[key] == 'null' || building[key] == null
              ? ''
              : building[key];
          resultHTML += '<td>' + keyVal + '</td>';
          resultHTML += '</tr>';
        }
      }
    }

    resultHTML += '</table>';

    resultHTML +=
      ' <div id = "share">' +
      '<button id="shareButton" class = "btn-info" onclick="generateShareURL()">Share</button>' +
      '</div>' +
      '<div id = "url">' +
      '</div>';

    dojoDom.byId('infoContent').innerHTML = resultHTML;

    var modal = document.getElementById('infoModal');
    var closeModal = document.getElementById('storyModal');
    closeModal.style.display = 'none';
    modal.style.display = 'block';
    var close = document.getElementById('modalClose');
    close.onclick = function () {
      modal.style.display = 'none';
    };
    app.result = bldgIndex;
    app.section = 'bldg';
    app.storyid = null;
  };

  function JYT_Query_Building(pJoinId, pTown, pYear) {
    var queryTaskFeatureLayer = new QueryTask(khtFSURL);
    var queryFeatureLayer = new Query();
    queryFeatureLayer.returnGeometry = true;
    queryFeatureLayer.outFields = ['*'];
    queryFeatureLayer.where =
      ' join_id = ' +
      pJoinId +
      " and place_nam = '" +
      pTown +
      "' and year=" +
      pYear;
    writeLog('JYT_Query_Building:' + queryFeatureLayer.where);

    queryTaskFeatureLayer.execute(
      queryFeatureLayer,
      function (featureResults) {
        var resultFLCount = featureResults.features.length;
        writeLog('JYT_Query_Building:' + resultFLCount);
        if (resultFLCount > 0) {
          var resultFeature = featureResults.features[0];
          var polygon = resultFeature.geometry;
          map.graphics.clear();
          map.graphics.add(new Graphic(polygon, selectionSymbol));
          var centerPt = polygon.getCentroid();
          map.centerAt(centerPt);
          app.MapCenterAt = centerPt;
          //     dojoDom.byId("messageDiv").innerHTML = resultFeature.attributes['address'];
          //      dojoDom.byId("messageDiv").innerHTML += ',' + pTown + ',' + pYear;
        }
      },
      function (error) {
        writeLog('JYT_Query_Building:' + error);
      }
    );
  }

  /**
   * Function to retrieve a person's details using a given array
   * @param index, index of person the retreive the details of
   * @param people, an array of people
   * @param other, a boolean true if being used to grab from other people array false otherwise
   */
  app.ArrayRetrievePersonDetails = function (index, people, other) {
    document.getElementById('demoClose').click(); //Close the demographic modal
    let person = people[index];
    // console.log(person);
    app.personid = person.attributes.objectid; //sets object id for url sharing

    ResetTileMapFromSearchResult(
      person.attributes.place_nam,
      person.attributes.year
    );

    ResetStoryPointDefinitionFilter(
      person.attributes.place_nam,
      person.attributes.year
    );

    Intersect_PolygonFS(
      person.attributes.join_id,
      person.attributes.place_nam,
      person.attributes.year,
      person.geometry.x,
      person.geometry.y
    );
    map.setLevel(18);

    var resultHTML =
      '<div><span id = "modalClose" class="close">&times;</span>';
    resultHTML += "<table class='searchResultTable'>";
    resultHTML += '<tr>';
    resultHTML +=
      '<th colspan=2>' +
      person.attributes.firstname +
      ' ' +
      person.attributes.lastname +
      '</td>';
    resultHTML += '</tr></div>';

    var displayMap = {
      lastname: 'Last Name',
      firstname: 'First Name',
      mi: 'Middle Initial',
      occupation: 'Occupation',
      workplac: 'Work Place',
      address: 'Address',
      tenure: 'Tenure',
      source: 'Source',
    };

    var tenureMap = {
      h: 'owns',
      r: 'owns',
      bds: 'rents',
      rms: 'rents',
      res: 'owns',
    };

    var occupationMap = {
      blksmith: 'blacksmith',
      bkkpr: 'bookkeeper',
      carp: 'carpenter',
      cash: 'cashier',
      clk: 'clerk',
      lab: 'laborer',
      mach: 'machinist',
      mkr: 'maker',
      mnfr: 'manufacturer',
      mngr: 'manager',
      pres: 'president',
      opr: 'operator',
      propr: 'proprietor',
      publr: 'publisher',
      sec: 'secretary',
      stenogr: 'stenographer',
      supt: 'superintendent',
      tchr: 'teacher',
      treas: 'treasurer',
    };

    for (var key in displayMap) {
      if (
        person.attributes.hasOwnProperty(key) &&
        displayMap.hasOwnProperty(key)
      ) {
        resultHTML += '<tr>';
        resultHTML += '<td>' + displayMap[key] + '</td>';
        //Gets value from tenure map
        var keyVal = null;
        switch (key) {
          case 'tenure':
            if (tenureMap.hasOwnProperty(person.attributes[key])) {
              keyVal = tenureMap[person.attributes[key]];
            } else {
              keyVal =
                person.attributes[key] == 'null' ||
                person.attributes[key] == null
                  ? ''
                  : person.attributes[key];
            }
            break;
          case 'occupation':
            if (occupationMap.hasOwnProperty(person.attributes[key])) {
              keyVal = occupationMap[person.attributes[key]];
            } else {
              keyVal =
                person.attributes[key] == 'null' ||
                person.attributes[key] == null
                  ? ''
                  : person.attributes[key];
            }
            break;
          default:
            keyVal =
              person.attributes[key] == 'null' || person.attributes[key] == null
                ? ''
                : person.attributes[key];
        }
        //Print adds check to remove null if found in a series of strings such as an address
        resultHTML +=
          '<td>' + keyVal.replace(/null | null|null,| null,/g, '') + '</td>';
        resultHTML += '</tr>';
      }
    }

    resultHTML += '</table>';

    resultHTML +=
      ' <div id = "share">' +
      '<button id="shareButton" class = "btn-info" onclick="generateShareURL()">Share</button>' +
      '</div>' +
      '<div id = "url">' +
      '</div>';

    //Takes the persons details, puts it into the infoMdal and opens it.
    dojoDom.byId('infoContent').innerHTML = resultHTML;
    var modal = document.getElementById('infoModal');
    var closeModal = document.getElementById('storyModal');
    closeModal.style.display = 'none';
    modal.style.display = 'block';
    var close = document.getElementById('modalClose');
    close.onclick = function () {
      modal.style.display = 'none';
    };
    app.result = index;
    app.section = 'people';
    app.storyid = null;
  };

  /**
   *   Function used to retrieve the details of a given person
   *   @param personIndex, Index of person in the peopleResultsJson array
   * */
  app.RetrievePersonDetails = function (personIndex) {
    var person = app.peopleResultJson[personIndex].person;
    //console.log(person);
    var mapPoint = new Point(
      person.x,
      person.y,
      new SpatialReference({ wkid: 102100 })
    );
    var newPointMarker = new Graphic(mapPoint, storyPointSymbol);
    map.graphics.clear();
    map.graphics.add(newPointMarker);

    dojoDom.byId('messageDiv').innerHTML = '';

    ResetTileMapFromSearchResult(person.town, person.year);

    ResetStoryPointDefinitionFilter(person.town, person.year);

    Intersect_PolygonFS(
      person.join_id,
      person.town,
      person.year,
      person.x,
      person.y
    );
    map.setLevel(18);

    var resultHTML =
      '<div><span id = "modalClose" class="close">&times;</span>';
    resultHTML += "<table class='searchResultTable'>";
    resultHTML += '<tr>';
    resultHTML += '<th colspan=2>' + person.short_descr + '</td>';
    resultHTML += '</tr></div>';

    var displayMap = {
      lastname: 'Last Name',
      firstname: 'First Name',
      mi: 'Middle Initial',
      occupation: 'Occupation',
      workplac: 'Work Place',
      address: 'Address',
      tenure: 'Tenure',
      source: 'Source',
    };

    var tenureMap = {
      h: 'owns',
      r: 'owns',
      bds: 'rents',
      rms: 'rents',
      res: 'owns',
    };

    var occupationMap = {
      blksmith: 'blacksmith',
      bkkpr: 'bookkeeper',
      carp: 'carpenter',
      cash: 'cashier',
      clk: 'clerk',
      lab: 'laborer',
      mach: 'machinist',
      mkr: 'maker',
      mnfr: 'manufacturer',
      mngr: 'manager',
      pres: 'president',
      opr: 'operator',
      propr: 'proprietor',
      publr: 'publisher',
      sec: 'secretary',
      stenogr: 'stenographer',
      supt: 'superintendent',
      tchr: 'teacher',
      treas: 'treasurer',
    };

    for (var key in displayMap) {
      if (person.hasOwnProperty(key) && displayMap.hasOwnProperty(key)) {
        resultHTML += '<tr>';
        resultHTML += '<td>' + displayMap[key] + '</td>';
        //Gets value from tenure map
        var keyVal = null;
        switch (key) {
          case 'tenure':
            if (tenureMap.hasOwnProperty(person[key])) {
              keyVal = tenureMap[person[key]];
            } else {
              keyVal =
                person[key] == 'null' || person[key] == null ? '' : person[key];
            }
            break;
          case 'occupation':
            if (occupationMap.hasOwnProperty(person[key])) {
              keyVal = occupationMap[person[key]];
            } else {
              keyVal =
                person[key] == 'null' || person[key] == null ? '' : person[key];
            }
            break;
          default:
            keyVal =
              person[key] == 'null' || person[key] == null ? '' : person[key];
        }
        //Print adds check to remove null if found in a series of strings such as an address
        resultHTML +=
          '<td>' + keyVal.replace(/null | null|null,| null,/g, '') + '</td>';
        resultHTML += '</tr>';
      }
    }

    resultHTML += '</table>';

    resultHTML +=
      ' <div id = "share">' +
      '<button id="shareButton" class = "btn-info" onclick="generateShareURL()">Share</button>' +
      '</div>' +
      '<div id = "url">' +
      '</div>';

    //Takes the persons details, puts it into the infoMdal and opens it.
    dojoDom.byId('infoContent').innerHTML = resultHTML;
    var modal = document.getElementById('infoModal');
    var closeModal = document.getElementById('storyModal');
    closeModal.style.display = 'none';
    modal.style.display = 'block';
    var close = document.getElementById('modalClose');
    close.onclick = function () {
      modal.style.display = 'none';
    };
    app.result = personIndex;
    app.section = 'people';
    app.storyid = null;
  };

  /**
   *   Function used to retrieve the details of a given place
   *   @param index, Index of place in the placeResultsJson array
   * */
  app.RetrievePlaceDetails = function (index) {
    var place = app.placeResultJson[index].place;
    var aGeometry = new Point(
      place.x,
      place.y,
      new SpatialReference({ wkid: 102100 })
    );
    app.CenterAtPoint(place.x, place.y);

    var newPointMarker = new Graphic(aGeometry, storyPointSymbol);
    map.graphics.add(newPointMarker);

    ResetTileMapFromSearchResult(
      place.place_nam,
      validServiceConfig.year,
      'story'
    );

    //ResetStoryPointDefinitionFilter(place.town,place.year);

    //Intersect_PolygonFS(place.join_id,place.place_nam,place.year,'','');

    var resultHTML = '<span id = "modalClose" class="close">&times;</span>';
    resultHTML += "<table class='searchResultTable'>";
    resultHTML += '<tr>';
    resultHTML += '<th colspan=2>' + place.short_descr + '</td>';
    resultHTML += '</tr>';

    var displayMap = {
      name: 'Name',
      place_type: 'Type',
      place_descr: 'Details',
      address: 'Address',
      town: 'Town',
      source: 'Source',
    };
    for (var key in place) {
      if (place.hasOwnProperty(key) && displayMap.hasOwnProperty(key)) {
        resultHTML += '<tr>';
        resultHTML += '<td>' + displayMap[key] + '</td>';
        resultHTML += '<td>' + place[key] + '</td>';
        resultHTML += '</tr>';
      }
    }
    resultHTML += '</table>';

    resultHTML +=
      ' <div id = "share">' +
      '<button id="shareButton" class = "btn-info" onclick="generateShareURL()">Share</button>' +
      '</div>' +
      '<div id = "url">' +
      '</div>';

    //Puts results into the infoModal and opens it up for viewing
    dojoDom.byId('infoContent').innerHTML = resultHTML;
    var modal = document.getElementById('infoModal');
    var closeModal = document.getElementById('storyModal');
    closeModal.style.display = 'none';
    modal.style.display = 'block';
    var close = document.getElementById('modalClose');
    close.onclick = function () {
      modal.style.display = 'none';
    };
    app.result = index;
    app.section = 'place';
    app.storyid = null;
  };

  /*********************
   * Function opens the result section with the most results
   */
  function openMostResults() {
    //See which results section has the most results and open corresponding Pane
    //Close any open panes
    dijit.byId('PlacePane').set('open', false);
    dijit.byId('PeoplePane').set('open', false);
    dijit.byId('StoryPane').set('open', false);
    dijit.byId('BldgPane').set('open', false);
    let max = 0;
    let open = 0; //Pane to be opened
    if (app.peopleResultJson.length > max) {
      max = app.peopleResultJson.length;
      open = 3;
    }
    if (app.placeResultJson.length > max) {
      max = app.placeResultJson.length;
      open = 2;
    }
    if (app.storyResultJson.length > max) {
      max = app.storyResultJson.length;
      open = 4;
    }
    if (app.buildingResultJson.length > max) {
      max = app.buildingResultJson.length;
      open = 1;
    }
    if (open !== 0) {
      openPane(open);
    }
  }
  /****************************************************************
   * 4.search - http://gis-core.sabu.mtu.edu/testSearch.php?q={my}&p={story}
   *     param sValue: keyword to be search
   *     param prev : if search is being used to get a previous value
   *     return : objectid,title,description,x,y,short_descr
   *     As the search function's all seemed to return the same results we used this one when consolidating into
   *     one search bar. We should look into combining the search scripts into one and therefor removing the need of the other search functions
   *     entirely
   ***************************************************************/
  function SearchFunc(sValue, prev) {
    app.curSearch = sValue;

    app.searchVal = sValue;
    //Add buttons to the page as needed
    if (app.searchPerformed > 0) {
      dojoDom.byId('prevSearch').hidden = false;
      app.searchPerformed += 1;
    }
    if (app.searchPerformed === 0) {
      //Adds these filters on the first search
      dojoDom.byId('filterBtns').hidden = false;
      dojoDom.byId('hideTilSearch').hidden = false;
      app.searchPerformed += 1;
    }

    dojoDom.byId('messageDiv').innerHTML = 'Searching....';
    xhr(TestURL, {
      handleAs: 'json', //"text",
      headers: { 'X-Requested-With': null },
      query: { q: sValue }, //,p:'story'
    }).then(
      function (data) {
        var results = data.results;
        //If there are results that already exist (ie found from geocoder) add them to results.
        //This ensure address searches don't get overwritten and other building results still appear
        // console.log(results);
        if (app.peopleResultJson != null) {
          if (app.peopleResultJson.length != 0) {
            app.peopleResultJson = app.peopleResultJson.concat(results.people);
          }
        } else {
          app.peopleResultJson = results.people;
        }
        if (app.placeResultJson != null) {
          if (app.placeResultJson.length != 0) {
            app.placeResultJson = app.placeResultJson.concat(results.place);
          }
        } else {
          app.placeResultJson = results.places;
        }
        if (app.buildingResultJson != null) {
          if (app.buildingResultJson.length != 0) {
            app.buildingResultJson = app.buildingResultJson.concat(
              results.buildings
            );
          }
        } else {
          app.buildingResultJson = results.buildings;
        }
        if (app.storyResultJson != null) {
          if (app.storyResultJson.length != 0) {
            app.storyResultJson = app.storyResultJson.concat(results.stories);
          }
        } else {
          app.storyResultJson = results.stories;
        }

        app.peopleSearchResultJson = app.peopleResultJson;
        app.placeSearchResultJson = app.placeResultJson;
        app.buildingSearchResultJson = app.buildingResultJson;
        app.storySearchResultJson = app.storyResultJson;

        //Resets x and y
        app.x = null;
        app.y = null;

        //Add filter numbers
        app.addFilterNumber();

        dijit.byId('tabPaneContainer').selectChild(registry.byId('StoryPane'));
        if (
          app.peopleResultJson.length +
            app.placeResultJson.length +
            app.buildingResultJson.length +
            app.storyResultJson.length >
          0
        ) {
          dojoDom.byId('messageDiv').innerHTML =
            'Select a result below (Please note that places are currently only from 1917)';
        } else {
          dojoDom.byId('messageDiv').innerHTML = 'No results found';
        }
        if (prev === true) {
          prevSearch();
        } else {
          GetShortDescription(); //Puts results into results accordian
        }
        applyFilter([[], [], []]); //Applies an empty filter.(Note this is needed for the functionality of the revert last search feature)
        //Open filters
        dijit.byId('Filters').set('open', true);

        //Check url to see if something has been passed in and if so go to it
        var url = new URL(window.location.href);
        var urlSearch = url.searchParams.get('s');
        var x = url.searchParams.get('x');
        var y = url.searchParams.get('y');

        if (url.searchParams.has('s') && app.load === 0) {
          var section = url.searchParams.get('rs');
          var index = url.searchParams.get('r');
          //Take binary string and turn in into array
          if (url.searchParams.has('yf')) {
            var urlFilterYears = url.searchParams.get('yf').split('');
          } else {
            var urlFilterYears = ['0', '0', '0', '0', '0', '0', '0', '0'];
          }
          if (url.searchParams.has('rf')) {
            var urlFilterRecords = url.searchParams.get('rf').split('');
          } else {
            var urlFilterRecords = ['0', '0', '0', '0', '0'];
          }
          if (url.searchParams.has('lf')) {
            var urlFilterLocations = url.searchParams.get('lf').split('');
          } else {
            var urlFilterLocations = [
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
            ];
          }
          //Create array of filters to be used for check filters based on based in url
          let filterYears = [];
          let filterRecords = [];
          let filterLocations = [];
          //create year array
          for (let i = 0; i < 8; i++) {
            if (urlFilterYears[i] == '1') {
              switch (i) {
                case 0:
                  filterYears.push('1880');
                  break;
                case 1:
                  filterYears.push('1890');
                  break;
                case 2:
                  filterYears.push('1900');
                  break;
                case 3:
                  filterYears.push('1910');
                  break;
                case 4:
                  filterYears.push('1920');
                  break;
                case 5:
                  filterYears.push('1930');
                  break;
                case 6:
                  filterYears.push('1940');
                  break;
                case 7:
                  filterYears.push('1950');
                  break;
              }
            }
          }
          //create records array
          for (let i = 0; i < 6; i++) {
            if (urlFilterRecords[i] == '1') {
              switch (i) {
                case 0:
                  filterRecords.push('Census Records');
                  break;
                case 1:
                  filterRecords.push('City Directory');
                  break;
                case 2:
                  filterRecords.push('School Records');
                  break;
                case 3:
                  filterRecords.push('Mining Employee Records');
                  break;
                case 4:
                  filterRecords.push('Stories');
                  break;
                case 5:
                  filterRecords.push('Other');
                  break;
              }
            }
          }
          //create location array
          for (let i = 0; i < 11; i++) {
            if (urlFilterLocations[i] == '1') {
              switch (i) {
                case 0:
                  filterLocations.push('Atlantic Mine');
                  break;
                case 1:
                  filterLocations.push('Calumet');
                  break;
                case 2:
                  filterLocations.push('Dollar Bay');
                  break;
                case 3:
                  filterLocations.push('Hancock');
                  break;
                case 4:
                  filterLocations.push('Houghton');
                  break;
                case 5:
                  filterLocations.push('Lake Linden');
                  break;
                case 6:
                  filterLocations.push('Laurium');
                  break;
                case 7:
                  filterLocations.push('Mohawk');
                  break;
                case 8:
                  filterLocations.push('Quincy');
                  break;
                case 9:
                  filterLocations.push('South Houghton County');
                  break;
                case 10:
                  filterLocations.push('South Range');
                  break;
              }
            }
          }
          checkFilters([filterYears, filterRecords, filterLocations]);
          applyFilter(getChecked());
          GetShortDescription();
          loadGivenResult(section, index);
          switch (section) {
            case 'bldg':
              openPane(1); //open corresponding pane
              app.selected(1, index); //indicate selected item
              break;
            case 'place':
              openPane(2);
              app.selected(2, index);
              break;
            case 'people':
              openPane(3);
              app.selected(3, index);
              break;
            case 'story':
              openPane(4);
              app.selected(4, index);
              break;
          }
        }
        app.load += 1;
      },
      function (error) {
        dojoDom.byId('searchResultStory').innerHTML = error.message;
      }
    );
  }

  /**
   *   Function used to retrieve the details of a given story
   *   @param index, Index of story in the storyResultsJson array
   * */
  app.RetrieveStoryDetails = function (index) {
    var story = app.storyResultJson[index].story;
    app.storyHolder = app.storyResultJson[index].story; //Holder for sharing
    // console.log(story.objectid);
    app.storyid = story.objectid;
    var aGeometry = new Point(
      story.x,
      story.y,
      new SpatialReference({ wkid: 102100 })
    );
    app.CenterAtPoint(story.x + 5, story.y - 5);

    var newPointMarker = new Graphic(aGeometry, storyPointSymbol);
    map.graphics.add(newPointMarker);

    // query polygon
    var queryTaskPolygon = new QueryTask(khtFSURL);
    var queryPolygon = new Query();
    queryPolygon.outFields = ['*'];
    queryPolygon.geometry = aGeometry;
    queryPolygon.returnGeometry = true;
    queryTaskPolygon.execute(
      queryPolygon,
      function (results) {
        var resultFLCount = results.features.length;
        if (resultFLCount > 0) {
          var resultFeature = results.features[0];
          var disTown = resultFeature.attributes['place_nam'];
          var disYear = story.mapyear;
          //dojoDom.byId("messageDiv").innerHTML = disTown + ',' + disYear;
          ResetTileMapFromSearchResult(disTown, disYear, 'story');
          ResetStoryPointDefinitionFilter(disTown, disYear);
        }
      },
      function (error) {
        writeLog('RetrieveStoryDetails-Intersect_Polygon:' + error.message);
      }
    );

    // query placename
    var queryTaskPlaceName = new QueryTask(placeNameURL);
    var queryPlaceName = new Query();
    queryPlaceName.outFields = ['*'];
    queryPlaceName.geometry = aGeometry;
    queryPlaceName.returnGeometry = true;
    queryTaskPlaceName.execute(
      queryPlaceName,
      function (results) {
        var resultFLCount = results.features.length;
        if (resultFLCount > 0) {
          var resultFeature = results.features[0];
          var disTown = resultFeature.attributes['region_nam'];
          var disYear = story.mapyear;
          //dojoDom.byId("messageDiv").innerHTML = disTown + ',' + disYear;
          ResetTileMapFromSearchResult(disTown, disYear, 'story');
        }
      },
      function (error) {
        writeLog('RetrieveStoryDetails-Intersect_PlaceNameFS:' + error.message);
      }
    );

    //Show story image and detail
    StoryImageSidePane(story.objectid);

    var resultHTML = '';
    resultHTML += "<table class='searchResultTable'>";
    resultHTML += '<tr>';
    resultHTML += '<th colspan=2>' + story.short_descr + '</td>';
    resultHTML += '</tr>';
    for (var key in story) {
      if (story.hasOwnProperty(key)) {
        resultHTML += '<tr>';
        resultHTML += '<td>' + key + '</td>';
        resultHTML += '<td>' + story[key] + '</td>';
        resultHTML += '</tr>';
      }
    }
    resultHTML += '</table>';

    resultHTML +=
      ' <div id = "share">' +
      '<button id="shareButton" class = "btn-info" onclick="generateShareURL()">Share</button>' +
      '</div>' +
      '<div id = "url">' +
      '</div>';

    //Opens the Story modal and displays the content for the user
    dojoDom.byId('storyContent').innerHTML = resultHTML;

    var modal = document.getElementById('storyModal');
    var closeModal = document.getElementById('infoModal');
    closeModal.style.display = 'none';
    modal.style.display = 'block';
    var close = document.getElementById('storyClose');
    close.onclick = function () {
      modal.style.display = 'none';
    };
    app.result = index;
    app.section = 'story';
  };

  /** Helper function to highlight a selected result when cliched
   * @param s, section where a result is being highlighted 1 =BLDG, 2 = places, 3 = people, 4 = stories
   * @param i, index of result(ie result selected that will be highlighted)
   * */
  app.lastSelectedSection = 0;
  app.lastSelectedIndex = 0;
  app.selected = function (s, i) {
    if (app.lastSelectedSection !== 0) {
      //If nothing has been selected before don't deselect anything
      deselect(app.lastSelectedSection, app.lastSelectedIndex);
    }
    var s;
    if (s === 1) {
      s = document.getElementById('bldg' + i.toString());
      app.lastSelectedSection = 1; //Update so can be reset later
      app.lastSelectedIndex = i;
    } else if (s === 2) {
      s = document.getElementById('place' + i.toString());
      app.lastSelectedSection = 2; //Update so can be reset later
      app.lastSelectedIndex = i;
    } else if (s === 3) {
      s = document.getElementById('person' + i.toString());
      app.lastSelectedSection = 3; //Update so can be reset later
      app.lastSelectedIndex = i;
    } else if (s === 4) {
      s = document.getElementById('story' + i.toString());
      app.lastSelectedSection = 4; //Update so can be reset later
      app.lastSelectedIndex = i;
    }
    s.setAttribute('class', 'buttonToDetailSelected');
  };

  function deselect(s, i) {
    var s;
    if (s === 1) {
      s = document.getElementById('bldg' + i.toString());
    } else if (s === 2) {
      s = document.getElementById('place' + i.toString());
    } else if (s === 3) {
      s = document.getElementById('person' + i.toString());
    } else if (s === 4) {
      s = document.getElementById('story' + i.toString());
    }
    s.setAttribute('class', 'buttonToDetail');
  }

  /**
   * Helper function to fill in specified tab with specified data
   * @param startindex, endindex Used to determine how many people will be put into the people Results category
   * */
  function GetPeople(startindex, endindex) {
    resultHTML = '';
    resultHTML = '';
    for (var i = 0; i < endindex; i++) {
      resultHTML += '<button class="buttonToDetail" id = "person' + i + '"';
      resultHTML +=
        ' onclick="app.RetrievePersonDetails(' +
        i +
        '); app.selected(' +
        3 +
        ',' +
        i +
        ');">';
      resultHTML += app.peopleResultJson[i].person.short_descr;
      +'</button>';
    }
    dojoDom.byId('searchResultPeople').innerHTML = resultHTML;
  }

  /**
   * Helper function to fill in specified tab with specified data
   * @param startindex, endindex Used to determine how many places will be put into the places results category
   * */
  function GetPlaces(startindex, endindex) {
    resultHTML = '';
    for (var i = 0; i < endindex; i++) {
      resultHTML += '<button class ="buttonToDetail" id="place' + i + '"';
      resultHTML +=
        ' onclick="app.RetrievePlaceDetails(' +
        i +
        '); app.selected(' +
        2 +
        ',' +
        i +
        ');">';
      resultHTML += app.placeResultJson[i].place.short_descr + '</button>';
    }
    dojoDom.byId('searchResultPlace').innerHTML = resultHTML;
  }

  /**
   * Helper function to fill in specified tab with specified data
   * @param startindex, endindex Used to determine how many buildings will be put into the building results category
   * */
  function GetBldg(startindex, endindex) {
    resultHTML = '';
    for (var i = 0; i < endindex; i++) {
      if (app.buildingResultJson[i].building.short_descr) {
        resultHTML += '<button class ="buttonToDetail" id="bldg' + i + '"';
        resultHTML +=
          ' onclick="app.RetrieveBldgDetails(' +
          i +
          '); app.selected(' +
          1 +
          ',' +
          i +
          ');">';
        resultHTML +=
          app.buildingResultJson[i].building.short_descr + '</button>';
      }
    }
    dojoDom.byId('searchResultBldgs').innerHTML = resultHTML;
  }

  /**
   * Helper function to fill in specified tab with specified data
   * @param startindex, endindex Used to determine how many stories will be put into the story results category
   * */
  function GetStory(startindex, endindex) {
    resultHTML = '';
    for (var i = 0; i < endindex; i++) {
      if (app.storyResultJson[i].story.short_descr) {
        resultHTML += '<button class ="buttonToDetail" id="story' + i + '"';
        resultHTML +=
          ' onclick="app.RetrieveStoryDetails(' +
          i +
          '); app.selected(' +
          4 +
          ',' +
          i +
          ');">';
        resultHTML += app.storyResultJson[i].story.short_descr + '</button>';
      }
    }
    dojoDom.byId('searchResultStory').innerHTML = resultHTML;
  }

  /* This is the function that adds the results into their respective tabs */
  function GetShortDescription() {
    //Makes filters visible and avaliable for use
    dojoDom.byId('filterMsg').hidden = true;
    dojoDom.byId('filtersUnavailable').hidden = true;
    dojoDom.byId('filterYear').hidden = false;
    dojoDom.byId('filterRecords').hidden = false;
    dojoDom.byId('filterLocations').hidden = false;
    dojoDom.byId('Filters').open = true;

    //Add people to containter
    if (app.peopleResultJson.length <= 0) {
      noPeopleHTML = '<p> No people were found</p>';
      dojoDom.byId('searchResultPeople').innerHTML = noPeopleHTML;
    } else {
      //If less than 10 results just print them all
      if (
        app.peopleResultJson.length <= 10 &&
        app.peopleResultJson.length > 0
      ) {
        GetPeople(0, app.peopleResultJson.length);
      } else {
        //Else only print first 10 and add button to view more
        GetPeople(0, 11); //Prints first 10 results
        //Add button to view more
        var moreResultsButton = new Button({ label: 'More Results' });
        moreResultsButton.startup();
        moreResultsButton.placeAt(dojoDom.byId('searchResultPeople'));
        moreResultsButton.on('click', function (event) {
          GetPeople(10, app.peopleResultJson.length);
        });
      }
    }

    //Add places to container
    if (app.placeResultJson.length <= 0) {
      noPlaceHTML = '<p> No places were found </p>';
      dojoDom.byId('searchResultPlace').innerHTML = noPlaceHTML; //Tells if no results for places were found
    } else {
      if (app.placeResultJson.length <= 10 && app.placeResultJson.length > 0) {
        GetPlaces(0, app.placeResultJson.length);
      } else {
        GetPlaces(0, 11); //Print first 10 results
        //Add button to view more
        var moreResultsButton2 = new Button({ label: 'More Results' });
        moreResultsButton2.startup();
        moreResultsButton2.placeAt(dojoDom.byId('searchResultPlace'));
        moreResultsButton2.on('click', function (event) {
          GetPlaces(10, app.placeResultJson.length);
        });
      }
    }

    //Add Bldg to container
    //Check if there are any results
    if (app.buildingResultJson.length <= 0) {
      noBldgHTML = '<p> No buildings were found </p>';
      dojoDom.byId('searchResultBldgs').innerHTML = noBldgHTML;
    } else {
      if (
        app.buildingResultJson.length <= 10 &&
        app.buildingResultJson.length > 0
      ) {
        GetBldg(0, app.buildingResultJson.length);
      } else {
        GetBldg(0, 11); //Print first 10 results
        //Add button to view more
        var moreResultsButton3 = new Button({ label: 'More Results' });
        moreResultsButton3.startup();
        moreResultsButton3.placeAt(dojoDom.byId('searchResultBldgs'));
        moreResultsButton3.on('click', function (event) {
          GetBldg(10, app.buildingResultJson.length);
        });
      }
    }

    //Add Stories to container
    //Checks if there are any results
    if (app.storyResultJson.length <= 0) {
      noStoryHTML = '<p> No stories were found </p>';
      dojoDom.byId('searchResultStory').innerHTML = noStoryHTML;
    } else {
      if (app.storyResultJson.length <= 10 && app.storyResultJson.length > 0) {
        GetStory(0, app.storyResultJson.length); //Adds first 10 results
      } else {
        GetStory(0, 11); //Print first 10 results
        //Add button to view more
        var moreResultsButton4 = new Button({ label: 'More Results' });
        moreResultsButton4.startup();
        moreResultsButton4.placeAt(dojoDom.byId('searchResultStory'));
        moreResultsButton4.on('click', function (event) {
          GetStory(10, app.storyResultJson.length);
        });
      }
    }

    registry
      .byId('PeoplePane')
      .set('title', 'People(' + app.peopleResultJson.length + ')');
    registry
      .byId('PlacePane')
      .set('title', 'Places 1917(' + app.placeResultJson.length + ')');
    registry
      .byId('BldgPane')
      .set('title', 'Buildings(' + app.buildingResultJson.length + ')');
    registry
      .byId('StoryPane')
      .set('title', 'Stories(' + app.storyResultJson.length + ')');
    openMostResults(); //Opens result section with most results
  }

  function ResetStoryPointDefinitionFilter(rTown, rYear) {
    // ?? apply layer definition query to story point maplayer
    //var storyPointFilter = " userdate =" + validServiceConfig.year + "'";
    //app.storyPointLayer.setDefinitionExpression(storyPointFilter);
  }

  /**Function to toggle opening and closing of titlePanes
   * @param i, the pane to be opened
   * 1 = bldg
   * 2 = place
   * 3 = people
   * 4 = stories
   * */
  function openPane(i) {
    switch (i) {
      case 1:
        dijit.byId('PlacePane').set('open', false);
        dijit.byId('PeoplePane').set('open', false);
        dijit.byId('StoryPane').set('open', false);
        dijit.byId('BldgPane').set('open', true);
        break;
      case 2:
        dijit.byId('BldgPane').set('open', false);
        dijit.byId('PlacePane').set('open', true);
        dijit.byId('PeoplePane').set('open', false);
        dijit.byId('StoryPane').set('open', false);
        break;
      case 3:
        dijit.byId('BldgPane').set('open', false);
        dijit.byId('PlacePane').set('open', false);
        dijit.byId('PeoplePane').set('open', true);
        dijit.byId('StoryPane').set('open', false);
        break;
      case 4:
        dijit.byId('BldgPane').set('open', false);
        dijit.byId('PlacePane').set('open', false);
        dijit.byId('PeoplePane').set('open', false);
        dijit.byId('StoryPane').set('open', true);
        break;
    }
  }

  /*****************************************************************
   * Filter funcionality
   * Returns an array of arrays with the indexes being as follows
   * 0 - checked years
   * 1 - checked Records
   * 2- checked locations
   *****************************************************************/
  function getChecked() {
    app.urlYears = [];
    app.urlRecords = [];
    app.urlLocations = [];
    //app.curChecked = [[], [], []]; //Current checked filters
    var years = [
      '1880',
      '1890',
      '1900',
      '1910',
      '1920',
      '1930',
      '1940',
      '1950',
    ]; //separated by decades
    var records = [
      'Census Records',
      'City Directory',
      'School Records',
      'Mining Employee Records',
      'Stories',
      'Other',
    ];
    var locations = [
      'Atlantic Mine',
      'Calumet',
      'Dollar Bay',
      'Hancock',
      'Houghton',
      'Lake Linden',
      'Laurium',
      'Mohawk',
      'Quincy',
      'South Houghton County',
      'South Range',
    ];

    //Arrays to hold the values that are checked
    var checkedYears = [];
    var checkedRecords = [];
    var checkedLocations = [];

    var checked = false;
    var i = 0;
    //Get the years that are checked
    for (i = 0; i < years.length; i++) {
      checked = false;
      checked = document.getElementById(years[i]).checked;
      if (checked == true) {
        checkedYears.push(years[i]);
        app.urlYears.push(1);
      } else {
        app.urlYears.push(0);
      }
    }

    //Get's the record types checked
    for (i = 0; i < records.length; i++) {
      checked = false;
      checked = document.getElementById(records[i]).checked;
      if (checked == true) {
        checkedRecords.push(records[i]);
        app.urlRecords.push(1);
      } else {
        app.urlRecords.push(0);
      }
    }

    //Get's the locations checked
    for (i = 0; i < locations.length; i++) {
      checked = false;
      checked = document.getElementById(locations[i]).checked;
      if (checked == true) {
        checkedLocations.push(locations[i]);
        app.urlLocations.push(1);
      } else {
        app.urlLocations.push(0);
      }
    }
    //app.curChecked = [checkedYears, checkedRecords, checkedLocations]; //Update current checked filters
    return [checkedYears, checkedRecords, checkedLocations];
  }

  /*****************************************************************
   * Filter application
   * param checkedData, The arrays that contain the filters to be applied. ex [[1920,1940],[City Directory],[Lake Linden]]
   * Applies filters to results and puts them respectively into
   * app.peopleResultJson
   * app.placeResultJson
   * app.storyResultJson
   * app.buildingResultJson
   *****************************************************************/
  function applyFilter(checkedData) {
    // var checkedData = getChecked();
    app.peopleResultJson = [];
    app.placeResultJson = [];
    app.storyResultJson = [];
    app.buildingResultJson = [];

    let totalYears = 0;
    for (let y = 0; y < checkedData[0].length; y++) {
      //loop through selected decades
      if (parseInt(checkedData[0][y]) == 1950) totalYears += 70;
      else totalYears += 10;
    }

    if (totalYears == 0)
      //check if 0, if so make 1 to prevent multiplying by 0
      totalYears = 1;
    let totalSource = checkedData[1].length;
    if (totalSource == 0)
      //check if 0, if so make 1 to prevent multiplying by 0
      totalSource = 1;
    let totalPlace = checkedData[2].length;
    if (totalPlace == 0)
      //check if 0, if so make 1 to prevent multiplying by 0
      totalPlace = 1;

    // Checks every Person
    for (let j = 0; j < app.peopleSearchResultJson.length; j++) {
      //loop through all search results
      let checked = false;
      let yearCheck = true;
      let sourceCheck = true;
      let placeCheck = true;
      let y = 0; //year iterator, set to -1 as first iteration increments by 1
      let s = 0; //source iterator
      let p = 0; //place iterator
      let d = 0; //decade iterator
      let yearRange = 10;
      if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;

      for (let t = 0; t < totalYears * totalSource * totalPlace; t++) {
        //loop through all filter combinations
        if (checked) break;
        if (t != 0) {
          //ignore incrementing during first iteration
          if (y < yearRange && checkedData[0].length > d) {
            //within the range and decade
            y++;
            if (y == 10 && yearRange == 10) {
              //if at end of decade go to next
              d++;
              y = 0;
              if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
            }
          } else if (s < checkedData[1].length) {
            s++;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          } else if (p < checkedData[2].length) {
            p++;
            s = 0;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          }
        }
        if (checkedData[0].length > 0)
          yearCheck = Boolean(
            app.peopleSearchResultJson[j].person.year ==
              parseInt(checkedData[0][d]) + y
          );
        if (checkedData[1].length > 0) {
          sourceCheck = Boolean(
            app.peopleSearchResultJson[j].person.source == checkedData[1][s]
          );
          if (app.peopleSearchResultJson[j].person.source == null) {
            sourceCheck = false;
          }
          if (typeof checkedData[1][s] !== 'undefined') {
            if (
              app.peopleSearchResultJson[j].person.source != null &&
              checkedData[1][s].includes('Directory')
            ) {
              sourceCheck = Boolean(
                app.peopleSearchResultJson[j].person.source.includes(
                  'Directory'
                )
              );
            }
            //If it doesn't fall in any category and is non-null put into the other category
            if (checkedData[1][s].includes('Other')) {
              if (app.peopleSearchResultJson[j].person.source == null) {
                sourceCheck = true; //its null so it is in the other category by default
              } else {
                //Check to see if it is a directory record or not
                let b = Boolean(
                  !app.peopleSearchResultJson[j].person.source.includes(
                    'Directory'
                  ) ||
                    app.peopleSearchResultJson[j].person.source.includes(
                      'null'
                    ) ||
                    app.peopleSearchResultJson[j].person.source == null
                );
                if (b) {
                  sourceCheck = true;
                } else {
                  sourceCheck = false;
                }
              }
            }
          }
        }
        if (checkedData[2].length > 0)
          placeCheck = Boolean(
            app.peopleSearchResultJson[j].person.town == checkedData[2][p]
          );

        if (yearCheck && sourceCheck && placeCheck) {
          app.peopleResultJson.push(app.peopleSearchResultJson[j]);
          checked = true;
          break;
        }
      }
    }

    // Checks every Place
    for (let j = 0; j < app.placeSearchResultJson.length; j++) {
      let checked = false;
      let yearCheck = true;
      let sourceCheck = true;
      let placeCheck = true;
      let y = 0; //year iterator
      let s = 0; //source iterator
      let p = 0; //place iterator
      let d = 0; //decade iterator
      let yearRange = 10;
      if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;

      for (let t = 0; t < totalYears * totalSource * totalPlace; t++) {
        //loop through all filter combinations
        if (checked) break;
        if (t != 0) {
          //ignore incrementing during first iteration
          if (y < yearRange && checkedData[0].length > d) {
            //within the range and decade
            y++;
            if (y == 10 && yearRange == 10) {
              //if at end of decade go to next
              d++;
              y = 0;
              if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
            }
          } else if (s < checkedData[1].length) {
            s++;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          } else if (p < checkedData[2].length) {
            p++;
            s = 0;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          }
        }
        if (checkedData[0].length > 0)
          yearCheck = Boolean(
            app.placeSearchResultJson[j].place.year ==
              parseInt(checkedData[0][d]) + y
          );
        if (checkedData[1].length > 0) {
          sourceCheck = Boolean(
            app.placeSearchResultJson[j].place.source == checkedData[1][s]
          );
          if (app.placeSearchResultJson[j].place.source == null) {
            sourceCheck = false;
          }
          if (typeof checkedData[1][s] !== 'undefined') {
            if (
              app.placeSearchResultJson[j].place.source != null &&
              checkedData[1][s].includes('Directory')
            ) {
              sourceCheck = Boolean(
                app.placeSearchResultJson[j].place.source.includes('Directory')
              );
            }
            //If it doesn't fall in any category and is non-null put into the other category
            if (checkedData[1][s].includes('Other')) {
              if (app.placeSearchResultJson[j].place.source == null) {
                sourceCheck = true; //If null it defaults to the other category
              } else {
                //Check if it is a directory or not
                let b = Boolean(
                  !app.placeSearchResultJson[j].place.source.includes(
                    'Directory'
                  ) ||
                    app.placeSearchResultJson[j].place.source.includes(
                      'null'
                    ) ||
                    app.placeSearchResultJson[j].place.source == null
                );
                if (b) {
                  sourceCheck = true;
                } else {
                  sourceCheck = false;
                }
              }
            }
          }
        }
        if (checkedData[2].length > 0)
          placeCheck = Boolean(
            app.placeSearchResultJson[j].place.place_nam == checkedData[2][p]
          );

        if (yearCheck && sourceCheck && placeCheck) {
          app.placeResultJson.push(app.placeSearchResultJson[j]);
          checked = true;
          break;
        }
      }
    }

    // Checks every Story
    for (let j = 0; j < app.storySearchResultJson.length; j++) {
      let checked = false;
      let yearCheck = true;
      let sourceCheck = true;
      let placeCheck = true;
      let y = 0; //year iterator
      let s = 0; //source iterator
      let p = 0; //place iterator
      let d = 0; //decade iterator
      let yearRange = 10;
      if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;

      for (let t = 0; t < totalYears * totalSource * totalPlace; t++) {
        //loop through all filter combinations
        if (checked) break;
        if (t != 0) {
          //ignore incrementing during first iteration
          if (y < yearRange && checkedData[0].length > d) {
            //within the range and decade
            y++;
            if (y == 10 && yearRange == 10) {
              //if at end of decade go to next
              d++;
              y = 0;
              if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
            }
          } else if (s < checkedData[1].length) {
            s++;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          } else if (p < checkedData[2].length) {
            p++;
            s = 0;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          }
        }
        if (checkedData[0].length > 0)
          yearCheck = Boolean(
            app.storySearchResultJson[j].story.year ==
              parseInt(checkedData[0][d]) + y
          );
        if (
          checkedData[1].length > 0 &&
          typeof checkedData[1][s] != 'undefined'
        ) {
          sourceCheck = false; //Stories don't have sources
          if (checkedData[1][s].includes('Stories')) {
            sourceCheck = true; //Will always be true if stories is selected
          }
        }
        if (checkedData[2].length > 0)
          placeCheck = Boolean(
            app.storySearchResultJson[j].story.place_name == checkedData[2][p]
          );

        if (yearCheck && sourceCheck && placeCheck) {
          app.storyResultJson.push(app.storySearchResultJson[j]);
          checked = true;
          break;
        }
      }
    }

    //app.buildingResultJson =
    // Checks every Building
    for (let j = 0; j < app.buildingSearchResultJson.length; j++) {
      let checked = false;
      let yearCheck = true;
      let sourceCheck = true;
      let placeCheck = true;
      let y = -1; //year iterator
      let s = 0; //source iterator
      let p = 0; //place iterator
      let d = 0; //decade iterator
      let yearRange = 10;
      if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;

      for (let t = 0; t < totalYears * totalSource * totalPlace; t++) {
        //loop through all filter combinations
        if (checked) break;
        if (t != 0) {
          //ignore incrementing during first iteration
          if (y < yearRange && checkedData[0].length > d) {
            //within the range and decade
            y++;
            if (y == 10 && yearRange == 10) {
              //if at end of decade go to next
              d++;
              y = 0;
              if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
            }
          } else if (s < checkedData[1].length) {
            s++;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          } else if (p < checkedData[2].length) {
            p++;
            s = 0;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          }
        }
        if (checkedData[0].length > 0)
          yearCheck = Boolean(
            app.buildingSearchResultJson[j].building.year ==
              parseInt(checkedData[0][d]) + y
          );
        if (checkedData[1].length > 0) {
          sourceCheck = Boolean(
            app.buildingSearchResultJson[j].building.source == checkedData[1][s]
          );
          if (app.buildingSearchResultJson[j].building.source == null) {
            sourceCheck = false;
          }
          if (typeof checkedData[1][s] !== 'undefined') {
            if (
              app.buildingSearchResultJson[j].building.source != null &&
              checkedData[1][s].includes('Directory')
            ) {
              sourceCheck = Boolean(
                app.buildingSearchResultJson[j].building.source.includes(
                  'Directory'
                )
              );
            }
            //If it doesn't fall in any category and is non-null put into the other category
            if (checkedData[1][s].includes('Other')) {
              if (app.buildingSearchResultJson[j].building.source == null) {
                sourceCheck = true; //If null it defaults to the other category
              } else {
                //Check if it is a directory or not
                let b = Boolean(
                  !app.buildingSearchResultJson[j].building.source.includes(
                    'Directory'
                  ) ||
                    app.buildingSearchResultJson[j].building.source.includes(
                      'null'
                    ) ||
                    app.buildingSearchResultJson[j].building.source == null
                );
                if (b) {
                  sourceCheck = true;
                } else {
                  sourceCheck = false;
                }
              }
            }
          }
        }
        if (checkedData[2].length > 0)
          placeCheck = Boolean(
            app.buildingResultJson[j].building.town == checkedData[2][p]
          );

        if (yearCheck && sourceCheck && placeCheck) {
          app.buildingResultJson.push(app.buildingSearchResultJson[j]);
          checked = true;
          break;
        }
      }
    }
  }

  /************************************************************************
   * Function which adds the number of filter results for a sub filter next to it
   * ******************************************************************/
  app.addFilterNumber = function () {
    let c = getChecked();
    //Add's these values to year filters
    getIndividualFilterNum(0, '1880', c);
    //Gets number for 1890
    getIndividualFilterNum(0, '1890', c);
    //Get # for 1900
    getIndividualFilterNum(0, '1900', c);
    //Get # for 1910
    getIndividualFilterNum(0, '1910', c);
    //Get # for 1920
    getIndividualFilterNum(0, '1920', c);
    //Get # for 1930
    getIndividualFilterNum(0, '1930', c);
    //Get # for 1940
    getIndividualFilterNum(0, '1940', c);
    //Get # for 1950
    getIndividualFilterNum(0, '1950', c);

    //GET NUMBERS FOR RECORD
    //census #
    getIndividualFilterNum(1, 'Census Records', c);
    //City #
    getIndividualFilterNum(1, 'City Directory', c);
    //school #
    getIndividualFilterNum(1, 'School Records', c);
    //employer #
    getIndividualFilterNum(1, 'Mining Employee Records', c);
    //Story #
    getIndividualFilterNum(1, 'Stories', c);
    //Other #
    getIndividualFilterNum(1, 'Other', c);

    //GET NUMBERS FOR LOCATIONS
    //Atlantic mine #
    getIndividualFilterNum(2, 'Atlantic Mine', c);
    //Calumet #
    getIndividualFilterNum(2, 'Calumet', c);
    //Dollar Bay #
    getIndividualFilterNum(2, 'Dollar Bay', c);
    //Hancock #
    getIndividualFilterNum(2, 'Hancock', c);
    //Houghton #
    getIndividualFilterNum(2, 'Houghton', c);
    //Lake Linden #
    getIndividualFilterNum(2, 'Lake Linden', c);
    //Laurium #
    getIndividualFilterNum(2, 'Laurium', c);
    //Mohwak #
    getIndividualFilterNum(2, 'Mohawk', c);
    //Quincy #
    getIndividualFilterNum(2, 'Quincy', c);
    //South Houghton County #
    getIndividualFilterNum(2, 'South Houghton County', c);
    //South Range #
    getIndividualFilterNum(2, 'South Range', c);
  };

  /** This is a function that is used to get the number value of records associated
   * with a filter and put the numbers on the page
   * @param section {int}, represents the section of filter 0 = years, 1 = results, 2 = location
   * @param val {string}, value of the filter (ie 1880, or City Directory, or Houghton)
   * @param c {array}, array of already checked filters, used to adjust based on how many records would be available based on that selected filters
   */
  function getIndividualFilterNum(section, val, c) {
    var temp = 0;
    var tempString;
    var checked = c.slice();
    switch (section) {
      case 0:
        var newHTML;
        checked[0] = [val];
        temp = getFilterNumber(checked);
        tempString = temp.toString(10);
        if (c[0].includes(val)) {
          newHTML =
            '' +
            '<input type="checkbox" id="' +
            val +
            '" value="year"' +
            "checked='true' onclick='callNum()'>" +
            '<label for=' +
            val +
            '>' +
            val +
            's (' +
            tempString +
            ')</label>';
        } else {
          newHTML =
            '' +
            '<input type="checkbox" id="' +
            val +
            '" value="year"' +
            "onclick='callNum()'>" +
            '<label for=' +
            val +
            '>' +
            val +
            's (' +
            tempString +
            ')</label>';
        }
        dojoDom.byId(val + 'num').innerHTML = newHTML;
        break;
      case 1:
        var newHTML1;
        checked[1] = [val];
        temp = getFilterNumber(checked);
        tempString = temp.toString(10);
        if (val == 'City Directory' || val == 'Stories' || val == 'Other') {
          //Dont add disabled features to City Directory or Stories
          if (c[1].includes(val)) {
            newHTML1 =
              '' +
              '<input type="checkbox" id="' +
              val +
              '"value="record"' +
              "checked = true onclick='callNum()'>" +
              '<label for=' +
              val +
              '>' +
              val +
              ' (' +
              tempString +
              ')</label>';
          } else {
            newHTML1 =
              '' +
              '<input type="checkbox" id="' +
              val +
              '"value="record"' +
              "onclick='callNum()'>" +
              '<label for=' +
              val +
              '>' +
              val +
              ' (' +
              tempString +
              ')</label>';
          }
        } else {
          if (c[1].includes(val)) {
            newHTML1 =
              '' +
              '<input type="checkbox" id="' +
              val +
              '"value="record"' +
              "checked = true onclick='callNum()' disabled='true'>" +
              '<label class="disabledFilter" for=' +
              val +
              '>' +
              val +
              ' (' +
              tempString +
              ')</label>';
          } else {
            newHTML1 =
              '' +
              '<input type="checkbox" id="' +
              val +
              '"value="record"' +
              "onclick='callNum()' disabled='true'>" +
              '<label class="disabledFilter" for=' +
              val +
              '>' +
              val +
              ' (' +
              tempString +
              ')</label>';
          }
        }

        dojoDom.byId(val + 'Num').innerHTML = newHTML1;
        break;
      case 2:
        var newHTML2;
        checked[2] = [val];
        //console.log(checked);
        temp = getFilterNumber(checked);
        tempString = temp.toString(10);
        if (c[2].includes(val)) {
          newHTML2 =
            '' +
            '<input type="checkbox" id="' +
            val +
            '" value="location"' +
            "checked = true onclick='callNum()'>" +
            '<label for=' +
            val +
            '>' +
            val +
            ' (' +
            tempString +
            ')</label>';
        } else {
          newHTML2 =
            '' +
            '<input type="checkbox" id="' +
            val +
            '" value="location"' +
            "onclick='callNum()'>" +
            '<label for=' +
            val +
            '>' +
            val +
            ' (' +
            tempString +
            ')</label>';
        }

        dojoDom.byId(val + 'Num').innerHTML = newHTML2;
        break;
    }
  }

  /***************************************************************************
   * Modified applyfilter used to get the number of results avaliable for a given sub-filter
   * param givenChecked, The filter/filter's to get the number of records for ex [[1920],[],[]]
   * ************************************************************/
  function getFilterNumber(givenChecked) {
    var checkedData = givenChecked;

    var numPeopleResult = [];
    var numPlaceResult = [];
    var numStoryResult = [];
    var numBuildingResult = [];

    let totalYears = 0;
    for (let y = 0; y < checkedData[0].length; y++) {
      //loop through selected decades
      if (parseInt(checkedData[0][y]) == 1950) totalYears += 70;
      else totalYears += 10;
    }

    if (totalYears == 0)
      //check if 0, if so make 1 to prevent multiplying by 0
      totalYears = 1;
    let totalSource = checkedData[1].length;
    if (totalSource == 0)
      //check if 0, if so make 1 to prevent multiplying by 0
      totalSource = 1;
    let totalPlace = checkedData[2].length;
    if (totalPlace == 0)
      //check if 0, if so make 1 to prevent multiplying by 0
      totalPlace = 1;

    // Checks every Person
    for (let j = 0; j < app.peopleSearchResultJson.length; j++) {
      //loop through all search results
      let checked = false;
      let yearCheck = true;
      let sourceCheck = true;
      let placeCheck = true;
      let y = 0; //year iterator, set to -1 as first iteration increments by 1
      let s = 0; //source iterator
      let p = 0; //place iterator
      let d = 0; //decade iterator
      let yearRange = 10;
      if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;

      for (let t = 0; t < totalYears * totalSource * totalPlace; t++) {
        //loop through all filter combinations
        if (checked) break;
        if (t != 0) {
          //ignore incrementing during first iteration
          if (y < yearRange && checkedData[0].length > d) {
            //within the range and decade
            y++;
            if (y == 10 && yearRange == 10) {
              //if at end of decade go to next
              d++;
              y = 0;
              if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
            }
          } else if (s < checkedData[1].length) {
            s++;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          } else if (p < checkedData[2].length) {
            p++;
            s = 0;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          }
        }
        if (checkedData[0].length > 0)
          yearCheck = Boolean(
            app.peopleSearchResultJson[j].person.year ==
              parseInt(checkedData[0][d]) + y
          );
        if (checkedData[1].length > 0) {
          sourceCheck = Boolean(
            app.peopleSearchResultJson[j].person.source == checkedData[1][s]
          );
          if (app.peopleSearchResultJson[j].person.source == null) {
            sourceCheck = false;
          }
          if (typeof checkedData[1][s] !== 'undefined') {
            if (
              app.peopleSearchResultJson[j].person.source != null &&
              checkedData[1][s].includes('Directory')
            ) {
              sourceCheck = Boolean(
                app.peopleSearchResultJson[j].person.source.includes(
                  'Directory'
                )
              );
            }
            //If it doesn't fall in any category and is non-null put into the other category
            if (checkedData[1][s].includes('Other')) {
              if (app.peopleSearchResultJson[j].person.source == null) {
                sourceCheck = true; //its null so it is in the other category by default
              } else {
                //Check to see if it is a directory record or not
                let b = Boolean(
                  !app.peopleSearchResultJson[j].person.source.includes(
                    'Directory'
                  ) ||
                    app.peopleSearchResultJson[j].person.source.includes(
                      'null'
                    ) ||
                    app.peopleSearchResultJson[j].person.source == null
                );
                if (b) {
                  sourceCheck = true;
                } else {
                  sourceCheck = false;
                }
              }
            }
          }
        }
        if (checkedData[2].length > 0)
          placeCheck = Boolean(
            app.peopleSearchResultJson[j].person.town == checkedData[2][p]
          );

        if (yearCheck && sourceCheck && placeCheck) {
          numPeopleResult.push(app.peopleSearchResultJson[j]);
          checked = true;
          break;
        }
      }
    }

    // Checks every Place
    for (let j = 0; j < app.placeSearchResultJson.length; j++) {
      let checked = false;
      let yearCheck = true;
      let sourceCheck = true;
      let placeCheck = true;
      let y = 0; //year iterator
      let s = 0; //source iterator
      let p = 0; //place iterator
      let d = 0; //decade iterator
      let yearRange = 10;
      if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;

      for (let t = 0; t < totalYears * totalSource * totalPlace; t++) {
        //loop through all filter combinations
        if (checked) break;
        if (t != 0) {
          //ignore incrementing during first iteration
          if (y < yearRange && checkedData[0].length > d) {
            //within the range and decade
            y++;
            if (y == 10 && yearRange == 10) {
              //if at end of decade go to next
              d++;
              y = 0;
              if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
            }
          } else if (s < checkedData[1].length) {
            s++;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          } else if (p < checkedData[2].length) {
            p++;
            s = 0;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          }
        }
        if (checkedData[0].length > 0)
          //console.log(app.placeSearchResultJson[j].place.year );
          yearCheck = Boolean(
            app.placeSearchResultJson[j].place.year ==
              parseInt(checkedData[0][d]) + y
          );
        if (checkedData[1].length > 0) {
          sourceCheck = Boolean(
            app.placeSearchResultJson[j].place.source == checkedData[1][s]
          );
          if (app.placeSearchResultJson[j].place.source == null) {
            sourceCheck = false;
          }
          if (typeof checkedData[1][s] !== 'undefined') {
            if (
              app.placeSearchResultJson[j].place.source != null &&
              checkedData[1][s].includes('Directory')
            ) {
              sourceCheck = Boolean(
                app.placeSearchResultJson[j].place.source.includes('Directory')
              );
            }
            //If it doesn't fall in any category and is non-null put into the other category
            if (checkedData[1][s].includes('Other')) {
              if (app.placeSearchResultJson[j].place.source == null) {
                sourceCheck = true; //If null it defaults to the other category
              } else {
                //Check if it is a directory or not
                let b = Boolean(
                  !app.placeSearchResultJson[j].place.source.includes(
                    'Directory'
                  ) ||
                    app.placeSearchResultJson[j].place.source.includes(
                      'null'
                    ) ||
                    app.placeSearchResultJson[j].place.source == null
                );
                if (b) {
                  sourceCheck = true;
                } else {
                  sourceCheck = false;
                }
              }
            }
          }
        }
        if (checkedData[2].length > 0)
          placeCheck = Boolean(
            app.placeSearchResultJson[j].place.place_nam == checkedData[2][p]
          );

        if (yearCheck && sourceCheck && placeCheck) {
          numPlaceResult.push(app.placeSearchResultJson[j]);
          checked = true;
          break;
        }
      }
    }

    // Checks every Story
    for (let j = 0; j < app.storySearchResultJson.length; j++) {
      let checked = false;
      let yearCheck = true;
      let sourceCheck = true;
      let placeCheck = true;
      let y = 0; //year iterator
      let s = 0; //source iterator
      let p = 0; //place iterator
      let d = 0; //decade iterator
      let yearRange = 10;
      if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;

      for (let t = 0; t < totalYears * totalSource * totalPlace; t++) {
        //loop through all filter combinations
        if (checked) break;
        if (t != 0) {
          //ignore incrementing during first iteration
          if (y < yearRange && checkedData[0].length > d) {
            //within the range and decade
            y++;
            if (y == 10 && yearRange == 10) {
              //if at end of decade go to next
              d++;
              y = 0;
              if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
            }
          } else if (s < checkedData[1].length) {
            s++;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          } else if (p < checkedData[2].length) {
            p++;
            s = 0;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          }
        }
        if (checkedData[0].length > 0)
          yearCheck = Boolean(
            app.storySearchResultJson[j].story.year ==
              parseInt(checkedData[0][d]) + y
          );
        if (
          checkedData[1].length > 0 &&
          typeof checkedData[1][s] != 'undefined'
        ) {
          sourceCheck = false; //Stories do not have a source category
          if (checkedData[1][s].includes('Stories')) {
            sourceCheck = true; //Will always be true if stories is selected
          }
        }
        if (checkedData[2].length > 0) {
          placeCheck = Boolean(
            app.storySearchResultJson[j].story.place_name == checkedData[2][p]
          );
        }

        if (yearCheck && sourceCheck && placeCheck) {
          numStoryResult.push(app.storySearchResultJson[j]);
          checked = true;
          break;
        }
      }
    }

    //app.buildingResultJson =
    // Checks every Building
    for (let j = 0; j < app.buildingSearchResultJson.length; j++) {
      let checked = false;
      let yearCheck = true;
      let sourceCheck = true;
      let placeCheck = true;
      let y = -1; //year iterator
      let s = 0; //source iterator
      let p = 0; //place iterator
      let d = 0; //decade iterator
      let yearRange = 10;
      if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;

      for (let t = 0; t < totalYears * totalSource * totalPlace; t++) {
        //loop through all filter combinations
        if (checked) break;
        if (t != 0) {
          //ignore incrementing during first iteration
          if (y < yearRange && checkedData[0].length > d) {
            //within the range and decade
            y++;
            if (y == 10 && yearRange == 10) {
              //if at end of decade go to next
              d++;
              y = 0;
              if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
            }
          } else if (s < checkedData[1].length) {
            s++;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          } else if (p < checkedData[2].length) {
            p++;
            s = 0;
            y = 0;
            d = 0;
            if (parseInt(checkedData[0][d]) == 1950) yearRange = 70;
          }
        }
        if (checkedData[0].length > 0)
          yearCheck = Boolean(
            app.buildingSearchResultJson[j].building.year ==
              parseInt(checkedData[0][d]) + y
          );
        if (checkedData[1].length > 0) {
          sourceCheck = Boolean(
            app.buildingSearchResultJson[j].building.source == checkedData[1][s]
          );
          if (app.buildingSearchResultJson[j].building.source == null) {
            sourceCheck = false;
          }
          if (typeof checkedData[1][s] !== 'undefined') {
            if (
              app.buildingSearchResultJson[j].building.source != null &&
              checkedData[1][s].includes('Directory')
            ) {
              sourceCheck = Boolean(
                app.buildingSearchResultJson[j].building.source.includes(
                  'Directory'
                )
              );
            }
            //If it doesn't fall in any category and is non-null put into the other category
            if (checkedData[1][s].includes('Other')) {
              if (app.buildingSearchResultJson[j].building.source == null) {
                sourceCheck = true; //If null it defaults to the other category
              } else {
                //Check if it is a directory or not
                let b = Boolean(
                  !app.buildingSearchResultJson[j].building.source.includes(
                    'Directory'
                  ) ||
                    app.buildingSearchResultJson[j].building.source.includes(
                      'null'
                    ) ||
                    app.buildingSearchResultJson[j].building.source == null
                );
                if (b) {
                  sourceCheck = true;
                } else {
                  sourceCheck = false;
                }
              }
            }
          }
        }
        if (checkedData[2].length > 0)
          placeCheck = Boolean(
            app.buildingResultJson[j].building.town == checkedData[2][p]
          );

        if (yearCheck && sourceCheck && placeCheck) {
          numBuildingResult.push(app.buildingSearchResultJson[j]);
          checked = true;
          break;
        }
      }
    }
    return (
      numBuildingResult.length +
      numPeopleResult.length +
      numPlaceResult.length +
      numStoryResult.length
    );
  }

  /*************************************
   * Clear filters function
   * Set's all filter checkbox's to false(unchecked)
   * ******************************************/
  function clearFilters() {
    //Resets Years
    document.getElementById('1880').checked = false;
    document.getElementById('1890').checked = false;
    document.getElementById('1900').checked = false;
    document.getElementById('1910').checked = false;
    document.getElementById('1920').checked = false;
    document.getElementById('1930').checked = false;
    document.getElementById('1940').checked = false;
    document.getElementById('1950').checked = false;

    //Resets Records
    document.getElementById('Census Records').checked = false;
    document.getElementById('School Records').checked = false;
    document.getElementById('Mining Employee Records').checked = false;
    document.getElementById('City Directory').checked = false;
    document.getElementById('Stories').checked = false;
    document.getElementById('Other').checked = false;
    //Reset Locations
    document.getElementById('Atlantic Mine').checked = false;
    document.getElementById('Calumet').checked = false;
    document.getElementById('Dollar Bay').checked = false;
    document.getElementById('Hancock').checked = false;
    document.getElementById('Houghton').checked = false;
    document.getElementById('Laurium').checked = false;
    document.getElementById('Lake Linden').checked = false;
    document.getElementById('Mohawk').checked = false;
    document.getElementById('Quincy').checked = false;
    document.getElementById('South Houghton County').checked = false;
    document.getElementById('South Range').checked = false;

    app.urlYears = [];
    app.urlRecords = [];
    app.urlLocations = [];
  }

  /****************************************************************
   * cleanup before doing any search
   ***************************************************************/
  function PrepareCleanForSearch() {
    map.graphics.clear();
    registry.byId('BldgPane').set('title', 'Buildings(0)');
    registry.byId('PeoplePane').set('title', 'People(0)');
    registry.byId('PlacePane').set('title', 'Places 1917(0)');
    registry.byId('StoryPane').set('title', 'Story(0)');

    dojoDom.byId('searchResultBldgs').innerHTML = '';
    dojoDom.byId('searchResultPeople').innerHTML = '';
    dojoDom.byId('searchResultPlace').innerHTML = '';
    dojoDom.byId('searchResultStory').innerHTML = '';
    dojoDom.byId('searchResultDetails').innerHTML = '';
    dojoDom.byId('photoPlaceHolder').innerHTML = '';
    dojoDom.byId('messageDiv').innerHTML = '';

    app.peopleSearchResultJson = null;
    app.placeSearchResultJson = null;
    app.storySearchResultJson = null;
    app.buildingSearchResultJson = null;

    app.peopleResultJson = null;
    app.placeResultJson = null;
    app.storyResultJson = null;
    app.buildingResultJson = null;

    app.lastSelectedSection = 0;
    app.lastSelectedIndex = 0;
  }

  /****************************************************************
   * query polygon FC with join_id,town,year,x,y to highlight the result
   ***************************************************************/
  function Intersect_PolygonFS(pJoinId, pTown, pYear, X, Y) {
    var aPoincenterPt;
    var hasXY = false;
    if (X > '' && Y > '') hasXY = true;
    if (hasXY)
      aPoincenterPt = new Point(X, Y, new SpatialReference({ wkid: 102100 }));
    var queryTaskFeatureLayer = new QueryTask(khtFSURL);
    var queryFeatureLayer = new Query();
    queryFeatureLayer.returnGeometry = true;
    queryFeatureLayer.outFields = ['*'];
    if (pJoinId > 0) {
      queryFeatureLayer.where =
        ' join_id = ' +
        pJoinId +
        " and place_nam = '" +
        pTown +
        "' and year=" +
        pYear;
    } else if (hasXY) {
      //map.graphics.add(new Graphic(aPoincenterPt, pointSymbol));
      queryFeatureLayer.where =
        " place_nam = '" + pTown + "' and year=" + pYear;
      queryFeatureLayer.geometry = aPoincenterPt;
      writeLog('Intersect_PolygonFS xy: ' + queryFeatureLayer.geometry);
    } else {
      return;
    }
    writeLog('Intersect_PolygonFS:' + queryFeatureLayer.where);

    queryTaskFeatureLayer.execute(
      queryFeatureLayer,
      function (featureResults) {
        var resultFLCount = featureResults.features.length;
        writeLog('Intersect_PolygonFS:' + resultFLCount);
        if (resultFLCount > 0) {
          // use the first one
          var resultFeature = featureResults.features[0];
          var polygon = resultFeature.geometry;
          map.graphics.clear();
          map.graphics.add(new Graphic(polygon, selectionSymbol));
          var centerPt = polygon.getCentroid();
          map.centerAt(centerPt);
          app.MapCenterAt = centerPt;

          //dojoDom.byId("messageDiv").innerHTML = resultFeature.attributes['address'];
          // dojoDom.byId("messageDiv").innerHTML += ',' + pTown + ',' + pYear;
        } else if (hasXY) {
          // intersect with placename FS
          map.centerAt(aPoincenterPt);
          app.MapCenterAt = aPoincenterPt;
          //alert('hasXY - Intersect_PlaceNameFS');
          Intersect_PlaceNameFS(aPoincenterPt);
        }
      },
      function (error) {
        writeLog('Intersect_PolygonFS:' + error.message);
      }
    );
  }

  function Intersect_PlaceNameFS(aGeometry) {
    var queryTaskFeatureLayer = new QueryTask(placeNameURL);
    var queryFeatureLayer = new Query();
    queryFeatureLayer.geometry = aGeometry;
    queryFeatureLayer.returnGeometry = true;
    queryFeatureLayer.outFields = ['*'];
    writeLog('Intersect_PlaceNameFS');

    queryTaskFeatureLayer.execute(
      queryFeatureLayer,
      function (featureResults) {
        resultFLCount = featureResults.features.length;
        writeLog(resultFLCount);
        if (resultFLCount > 0) {
          var resultFeature = featureResults.features[0];
          var disTown = resultFeature.attributes['region_nam'];
          var disYear = validServiceConfig.year;
          //dojoDom.byId("messageDiv").innerHTML = disTown + ',' + disYear;
        }
      },
      function (error) {
        writeLog('Intersect_PlaceNameFS:' + error.message);
      }
    );
  }

  app.GetDecadeBinTiledServiceURL = function (dTownName, dYear) {
    //console.log("RANBINSERVICE")
    for (var k = 0; k < decadeBin.Services.length; k++) {
      var label = decadeBin.Services[k].label;
      var startyear = decadeBin.Services[k].startYear;
      var endyear = decadeBin.Services[k].endYear;
      if (startyear <= dYear && endyear >= dYear) {
        var townservices = decadeBin.Services[k].townservice;
        for (var j = 0; j < townservices.length; j++) {
          var name = townservices[j].name;
          var year = townservices[j].year;
          //writeLog('found:' + name + ',' + mservice + ',' + year  );
          if (dTownName == name) {
            for (var i = 0; i < kht.Services.length; i++) {
              if (
                kht.Services[i].name == name &&
                kht.Services[i].year == year
              ) {
                //console.log(kht.Services[i]);
                return kht.Services[i];
              }
            }
            // tiled map service is not in kht config
            console.log('missing tiled map service for:' + name + ',' + year);
            //return arcgisrest + 'KeweenawHSDI/' + mservice + '/MapServer';
          }
        }
      }
    }
    return '';
  };

  /****************************************************************
   * other function
   ***************************************************************/
  function Equals(strOne, strTwo) {
    if (strOne.toLowerCase().trim() == strTwo.toLowerCase().trim()) return true;
    else return false;
  }

  function writeLog(msg) {
    if (debugLevel == 'debug') {
      //console.log(msg);
      var debugText = document.getElementById('debugTextArea');
      var d = new Date();
      var n = d.toLocaleString();
      debugText.value = n + ' -> ' + debugText.value + '\n' + msg;
    }
  }

  /****************************************************************
   * get URL parameter
   ***************************************************************/
  function getUrlParameter(name) {
    var params = dojoIoQuery.queryToObject(
      decodeURIComponent(document.location.search.slice(1))
    );
    return params[name];
  }

  /****************************************************************
   * top banner buttons
   ***************************************************************/
  document.getElementById('BldgColorPTask').src =
    imgRoot + '/top_buttons/doc_mat_off.png';
  document.getElementById('BldgUseTask').src =
    imgRoot + '/top_buttons/doc_use_off.png';
  document.getElementById('BldgTextTask').src =
    imgRoot + '/top_buttons/transcribe_off.png';
  document.getElementById('ExploreMap').src =
    imgRoot + '/top_buttons/explore_on.png';
  document.getElementById('showDebugDiv').src =
    imgRoot + '/top_buttons/banner_icon.png';
  document.getElementById('Home').src = imgRoot + '/top_buttons/home.png';
  document.getElementById('Instructions').src =
    imgRoot + '/top_buttons/help.png';
  document.getElementById('ShareStory').src =
    imgRoot + '/top_buttons/share_story.png';

  dojo.query('#Home').onclick(function (evt) {
    window.location = 'http://www.keweenawhistory.com';
  });

  dojo.query('#submitFeedback').onclick(function (evt) {
    // Fill the sidebar with the new feedback form
    $('#popupContent').html($('#newFeedbackPopup').html());

    // Show the sidebar
    $('#pointPopup').modal('show');
    return;
  });
  dojo.query('#BldgColorPTask').onclick(function (evt) {
    window.location =
      'http://geospatialresearch.mtu.edu/kett/index.html?task=color';
  });
  dojo.query('#BldgUseTask').onclick(function (evt) {
    window.location =
      'http://geospatialresearch.mtu.edu/kett/index.html?task=use';
  });
  dojo.query('#BldgTextTask').onclick(function (evt) {
    window.location =
      'http://geospatialresearch.mtu.edu/kett/index.html?task=text';
  });

  dojo.query('#showDebugDiv').onclick(function (evt) {
    //domStyle.set(dojo.byId("debugTextArea"),'visibility','visible');
    //registry.byId("debugDiv").show();
  });

  app.CenterAtPoint = function (X, Y) {
    map.setLevel(18);
    HighlightCenterAtPoint(X, Y);
  };

  function HighlightCenterAtPoint(X, Y) {
    map.graphics.clear();
    var centerPt = new Point(X, Y, new SpatialReference({ wkid: 102100 }));
    map.graphics.add(new Graphic(centerPt, pointSymbol));
    map.centerAt(centerPt);
    app.MapCenterAt = centerPt;
  }

  function RefreshTileMap() {
    for (var i = 0; i < kht.Services.length; i++) {
      if (
        kht.Services[i].name == pTown &&
        kht.Services[i].year == pYear &&
        kht.Services[i].mapservice
      ) {
        if (validServiceConfig.id != kht.Services[i].id) {
          validServiceConfig = kht.Services[i];
          populateLocations();
        }
        break;
      }
    }
  }

  function selectPolygon(globalid) {
    var relUrl = khtFSURL;
    var queryTaskFeatureLayer = new QueryTask(relUrl);
    var queryFeatureLayer = new Query();
    queryFeatureLayer.returnGeometry = true;
    queryFeatureLayer.outFields = ['*'];
    queryFeatureLayer.where = " globalid = '" + globalid + "'";
    queryTaskFeatureLayer.execute(
      queryFeatureLayer,
      function (featureResults) {
        resultFLCount = featureResults.features.length;
        if (resultFLCount > 0) {
          var resultFeature = featureResults.features[0];
          var polygon = resultFeature.geometry;
          map.graphics.clear();
          map.graphics.add(new Graphic(polygon, selectionSymbol));
          var centerPt = polygon.getCentroid();
          map.centerAt(centerPt);
          app.MapCenterAt = centerPt;
        }
      },
      function (error) {
        alert(error);
      }
    );
  }

  function selectStoryPoint(objectid) {
    var relUrl = SearchStoryPhotoURL;
    var queryTaskFeatureLayer = new QueryTask(relUrl);
    var queryFeatureLayer = new Query();
    queryFeatureLayer.returnGeometry = true;
    queryFeatureLayer.outFields = ['*'];
    queryFeatureLayer.where = " objectid = '" + objectid + "'";
    queryTaskFeatureLayer.execute(
      queryFeatureLayer,
      function (featureResults) {
        resultFLCount = featureResults.features.length;
        if (resultFLCount > 0) {
          var resultFeature = featureResults.features[0];
          //var polygon = resultFeature.geometry;
          //map.graphics.add(new Graphic(polygon, selectionSymbol));
          var centerPt = resultFeature.geometry; //polygon.getCentroid();
          map.centerAt(centerPt);
          app.MapCenterAt = centerPt;
        }
      },
      function (error) {
        alert(error);
      }
    );
  }

  /*********************************************************************
   * Function to act like a click on the map has occured for the purpose of loading in results
   * */
  function loadXY(x, y) {
    var pxWidth = map.extent.getWidth() / map.width;
    var padding = 3 * pxWidth;
    var queryGeom = new Extent({
      xmin: x - padding,
      ymin: y - padding,
      xmax: parseFloat(x + padding),
      ymax: parseFloat(y + padding),
      spatialReference: { wkid: 102100 },
    });

    app.polygonFCQuery.geometry = queryGeom;
    app.polygonFCQuery.where = ' year=' + validServiceConfig.year;

    app.placeNameFCQuery.geometry = queryGeom;
    app.placeNameFCQuery.where =
      " region_nam='" + validServiceConfig.name + "'";
    app.placeNameFCQuery.where +=
      " and years_csv like '%" + validServiceConfig.year + "%'";

    app.storyPointFCQuery.geometry = queryGeom;
    app.storyPointFCQuery.where = ' flag is null';

    //console.log(app.polygonFCQuery);

    var polygonResults = app.polygonFCQueryTask.execute(app.polygonFCQuery);
    var placeNameResults = app.placeNameFCQueryTask.execute(
      app.placeNameFCQuery
    );
    var storyPointResults = app.storyPointFCQueryTask.execute(
      app.storyPointFCQuery
    );

    //console.log("deferreds: ", polygonResults, placeNameResults, storyPointResults);

    //Clear Filters and update the counts
    clearFilters();
    app.searchVal = null; //Resets search value for generating url's
    app.urlYears = [];
    app.urlRecords = [];
    app.urlLocations = [];
    app.peopleSearchResultJson = [];
    app.placeSearchResultJson = [];
    app.buildingSearchResultJson = [];
    app.storySearchResultJson = [];
    app.addFilterNumber(); //Resets the filter numbers(ie available records)
    //Clear search bar
    app.search.clear();
    //Add Restore last search button if needed(ie A search was performed prior to clicking the map. If not then the button will not be added)
    if (app.searchPerformed > 0) {
      dojoDom.byId('prevSearch').hidden = false;
      app.prevFilters = app.curChecked; //Updates prevFilters
      app.prevSearch = app.curSearch; //Updates prevSearch
    }

    promises = promiseAll([
      polygonResults,
      placeNameResults,
      storyPointResults,
    ]);
    promises.then(handleMapClickQueryResults);
    // console.log("created list");
  }

  /*******************************************************************
   * Parse the url to if there are values to be used to load something specific
   * ********************************/
  function parseUrl() {
    let url = new URL(window.location.href);
    let urlSearch = url.searchParams.get('s');
    app.searchVal = urlSearch;
    let urlX = url.searchParams.get('x');
    app.x = urlX;
    let urlY = url.searchParams.get('y');
    app.y = urlY;
    let urlLoc = url.searchParams.get('l'); //location
    app.mapLoc = urlLoc;
    let urlYear = url.searchParams.get('my');
    app.mapYear = urlYear;
    let urlStoryId = url.searchParams.get('sid');
    app.storyid = urlStoryId;
    let urlPersonId = url.searchParams.get('pid');
    app.personid = urlPersonId;
    app.load = 0;
    if (app.load == 0) {
      if (url.searchParams.has('s')) {
        app.search.set('value', urlSearch);
        //Makes use of prevSearchFunction in order to apply Filters
        SearchFunc(urlSearch, 0);
      }

      if (url.searchParams.has('x') && !url.searchParams.has('sid')) {
        ResetTileMapFromSearchResult(urlLoc, urlYear); //Sets map to corresponding location and year
        loadXY(urlX, urlY); //Loads given XY and then perfomres byId. This is a slightly modified mapClickHandler
        //Loading of result is done int he search byID function
      }

      if (url.searchParams.has('sid') && !url.searchParams.has('s')) {
        ResetTileMapFromSearchResult(urlLoc, urlYear);
        var mpoint = new Point(
          urlX,
          urlY,
          new SpatialReference({ wkid: 102100 })
        ); //Creates map point
        var graphic = new Graphic(mpoint, storyPointSymbol);
        map.graphics.add(graphic); //Add pointer image
        StoryImageSidePane(urlStoryId); //Open story
        map.centerAt(mpoint); //Move map to corresponding location
      }
      if (url.searchParams.has('pid')) {
        xhr(demographicURL, {
          handleAs: 'json',
          headers: { 'X-Requested-With': null },
          query: { id: urlPersonId },
        }).then(function (data) {
          //  console.log(data);
          let person = data.results.people;
          app.peopleResultJson = person;
          app.RetrievePersonDetails(0);
        });
      }
    }
  }

  /****************************************************************
   * registers function when DOM been resolved
   * initializes validServiceConfig and loads map to default of Calumet 1900
   ***************************************************************/
  dojo.ready(function () {
    var pLocation = 'Calumet'; //getUrlParameter('location');
    var pYear = '1900'; //getUrlParameter('year');
    for (var i = 0; i < kht.Services.length; i++) {
      if (
        kht.Services[i].name == pLocation &&
        kht.Services[i].year == pYear &&
        kht.Services[i].mapservice
      ) {
        validServiceConfig = kht.Services[i];
        break;
      }
    }
    if (validServiceConfig) {
      populateLocations();
    } else {
      alert('no valid param');
    }
    parseUrl();

    // to create story point
    dojo.query('#ShareStory').onclick(function (evt) {
      var isVisible = domStyle.get('swipeDiv', 'visibility') == 'visible';
      if (isVisible) return;

      // 0 - zoom,navigation
      // 1 - spyglass
      // 2 - click selection
      // 3 - click add new story point
      app.ChangeSelectionMode(3);

      map.graphics.clear();

      if (!INSTRUCTIONS_ACCEPTED) {
        $('#submission-instructions-modal').modal('show').fadeIn('fast');
      }
    });

    dojo.query('#inappContentLink').onclick(function (rep) {
      $('#inappContentPopup').modal('show');
    });

    // to select building
    //dojo.query('#userSelection').onclick( function(evt) { app.ChangeSelectionMode(2);});
    // to navigate
    //dojo.query('#selectionMode').onclick( function(evt) { app.ChangeSelectionMode(0);});

    domStyle.set(dojo.byId('yearTopDiv'), 'visibility', 'visible');
    domStyle.set(dojo.byId('yearUnderDiv'), 'visibility', 'visible');
    domStyle.set(dojo.byId('tranSliderABC'), 'visibility', 'visible');
    domStyle.set(dojo.byId('verticalSliderDiv'), 'visibility', 'visible');

    // Submit the story point when the submit button is clicked
    document.addEventListener('submit', function (e) {
      var elem,
        evt = e ? e : event;
      if (evt.srcElement) elem = evt.srcElement;
      else if (evt.target) elem = evt.target;
      if (elem.id != 'newPointForm' && elem.id != 'newFeedbackForm') return;
      evt.preventDefault();
      if (elem.id == 'newPointForm') {
        app.storyPointSubmit(app.newStoryPoint, null);
      } else if (elem.id == 'newFeedbackForm') {
        //window.location.href = ';
        var email = document.getElementById('emailInput').value;
        var name = document.getElementById('nameInput').value;
        var message = document.getElementById('explainInput').value;
        var city = document.getElementById('locationSelect').value;
        var year = document.getElementById('yearSelect').value;
        var jsonDump = JSON.stringify(app.buildingResultJson);
        var msgBody =
          'From: ' +
          name +
          '%0A' +
          'Email: ' +
          email +
          '%0A' +
          'City: ' +
          city +
          '%0A' +
          'Year: ' +
          year +
          '%0A' +
          'Polygon JSON dump:%0A' +
          jsonDump +
          '%0A' +
          'Description: %0A' +
          message +
          '%0A';
        var fed = new XMLHttpRequest();
        fed.open(
          'GET',
          'email_send.php?' +
            'name=' +
            name +
            '&message=' +
            message +
            '&email=' +
            email +
            '&city=' +
            city +
            '&year=' +
            year +
            '&jsonDump=' +
            jsonDump +
            '&msgBody=' +
            msgBody,
          true
        );
        fed.send();
        setTimeout(function () {
          $('#pointPopup').modal('hide');
        }, 2000);
      }
    });

    setupSearchSelection();
  });

  var obj = dijit.byId('searchTypeMenu');
  if (obj) {
    obj.attr('style', 'color: white');
    obj.attr('style', 'height: 40px;');
    obj.attr('style', 'background-color: black');
  }

  app.CenterAtTownCentroid = function (townname) {
    if (app.tiledMapChangeRecenterMap == false) return;
    try {
      for (var i = 0; i < townCentroid.centroids.length; i++) {
        if (townCentroid.centroids[i].name == townname) {
          var centerPt = new Point(
            townCentroid.centroids[i].x,
            townCentroid.centroids[i].y,
            new SpatialReference({ wkid: 102100 })
          );
          map.centerAt(centerPt);
          if (townCentroid.centroids[i].level) {
            map.setLevel(townCentroid.centroids[i].level);
          }
        }
        //writeLog (townCentroid.centroids[i].name + ',' + townCentroid.centroids[i].x + ',' + townCentroid.centroids[i].y);
      }
    } catch (err) {
      writeLog(err.message);
    }
  };

  // $("#demographics").on("click", function () {
  //     $("#demographics-modal").modal("show");
  // });

  //JQuery to allow modals to move
  $('#storyModal').draggable({
    // handle: ".modal-content"
  });

  $('#infoModal').draggable({
    // handle: ".modal-content"
  });

  /****************************************************************
   * get information for story point
   * Outputs the information into the storyContent modal
   ***************************************************************/
  function StoryImageSidePane(objectid) {
    //if info modal is open this closes it
    var closeModal = document.getElementById('infoModal');
    closeModal.style.display = 'none';
    //app.storyid = objectid;
    //console.log("OVJECTID:"+objectid);
    //console.log("StoryImage");
    // There should only ever be one result
    var queryStoryPt = new Query();
    queryStoryPt.returnGeometry = false;
    queryStoryPt.where = 'objectid=' + objectid;
    queryStoryPt.outFields = ['*'];
    var queryTaskPlaceName = new QueryTask(StoryPointURL);
    queryTaskPlaceName.execute(
      queryStoryPt,
      function (results) {
        // Pull off attributes we're interested in
        var feature = results.features[0];
        var title = feature.attributes['title'];
        var author = feature.attributes['name'];
        var descr = feature.attributes['description'];
        var date =
          feature.attributes['userdate'] == null
            ? null
            : feature.attributes['userdate'];
        var gid = feature.attributes['globalid'];

        //Opens the story modal
        dojoDom.byId('storyContent').innerHTML = $(
          '#existingPointPopup'
        ).html();
        var modal = document.getElementById('storyModal');
        modal.style.display = 'block';
        var close = document.getElementById('storyClose');
        close.onclick = function () {
          modal.style.display = 'none';
        };

        // Set the title of the sidebar to be the point's title
        $('#cur-point-name').text(title);

        if (date != null) {
          $('#cur-point-date').text(date);
        } else {
          $('#cur-point-date').hide();
        }

        // Set the author of the point in the sidebar
        if (author.length > 0) {
          $('#cur-point-author').text('By ' + author);
        } else {
          // If the point is anonymous, hide the author section
          $('#cur-point-author').hide();
        }

        // Set the description of the point in the sidebar
        if (descr.length > 0) {
          // Convert links in the description to actual links
          $('#cur-point-desc').text(descr).linkify();
        } else {
          // If no description, don't show the section
          $('#cur-point-desc-section').hide();
        }

        $('#inappContentLink').on('click', function () {
          $('#image-modal-label').text('Flag ' + title + ' for removal');
          $('#btn-flag')
            .off('click')
            .on('click', function () {
              feature.attributes['flag'] = 'i';
              var featureLayer = app.storyPointLayer;
              featureLayer.applyEdits(null, [feature], null);
              app.unselectStoryPoint();
              $('#inapp-modal').modal('hide');

              dojoDom.byId('pointShareTip').innerHTML =
                'Thank you! This content will be removed immediately';
              domStyle.set(dojo.byId('pointShareTip'), 'visibility', 'visible');
              $('#pointShareTip').fadeIn('slow');
              $('#pointShareTip').fadeOut(4800);
            });

          $('#inapp-modal').modal('show');
        });

        // Show the image attachments for the point
        let imageList = $('#cur-point-attachments');
        imageList.empty();

        app.storyPointLayer.queryAttachmentInfos(
          objectid,
          function (attachments) {
            // console.log(attachments);
            synchronizeAttachmentPreviews(attachments);
            $('#point-attachments-section').show();
          },
          function (error) {
            writeLog(error.message);
          }
        );

        //var FACEBOOK_PREFIX = "http://www.csl.mtu.edu/classes/cs4760/www/projects/s17/group1/www/other/GeoDev/html/index.html#";

        var FACEBOOK_PREFIX =
          'http://geospatialresearch.mtu.edu/kettexplorerapp/index.html#';
        //var FACEBOOK_PREFIX = "http://geospatialresearch.mtu.edu/kettexplorer/index.html#";

        // make facebook go through the page again
        // see http://stackoverflow.com/questions/34053622/how-to-change-the-data-href-in-facebook-comments
        // "The SDK only goes through your document once on initialization – if you change the DOM afterwards, you need to call FB.XFBML.parse to make it go through your document again."
        var fbComments = document.getElementById('facebook_comments');
        fbComments.setAttribute('fb-xfbml-state', null); // Fixes the weird bug where half a comment box shows
        fbComments.setAttribute('data-href', FACEBOOK_PREFIX + gid);
        FB.XFBML.parse();
      },
      function (error) {
        writeLog(error.message);
      }
    );
  }

  app.formSubmittedMessage = function () {
    dojoDom.byId('pointShareTip').innerHTML =
      'Thank you! Click your point in a moment to see your submission.';
    domStyle.set(dojo.byId('pointShareTip'), 'visibility', 'visible');
    $('#pointShareTip').show();
    setTimeout(function () {
      $('#pointShareTip').fadeOut('slow');
    }, 8000);
  };

  /****************************************************************
   * to create story point
   ***************************************************************/
  app.storyPointSubmit = function (geometry, year) {
    // @param {*} The geometry of the point to submit (ex. x and y coordinates)
    // @param {*} The year that is currently selected via the year select widget
    var form = document.getElementById('newPointForm');
    //  console.log(form);
    var parsedDate = app.parseDateEntry(form.dateInput2.value);
    if (parsedDate.valid == false) {
      alert('Invalid date entry: ' + parsedDate.invalidReason);
      return;
    }
    const attributes = {
      title: form.titleInput2.value,
      name: form.nameInput2.value,
      description: form.descInput2.value,
      beginDate: parsedDate.beginDate.getTime(),
      endDate: parsedDate.endDate.getTime(),
      dateEstimated: parsedDate.accuracyLevel,
      userdate: form.dateInput2.value,
      mapyear: validServiceConfig.year,
    };

    // Create a point feature to submit to the service
    const point = new Graphic(geometry, null, attributes, null);

    // Make the point look like what attachmentify and selectPoint expect
    const pt = { graphic: point };
    // Add the point to the feature service
    var featureLayer = app.storyPointLayer;
    featureLayer.applyEdits(
      [point],
      null,
      null,
      function (results) {
        if (results.length == 1) {
          // Update object ID to the permanent one
          pt.graphic.attributes.objectid = results[0].objectId;
          pt.graphic.attributes.globalid = results[0].globalId;

          // Add attachments
          attachmentifyPoint(pt);
          // Upload all of the images as attachments
          var files = [];
          for (file in CURRENT_FILES) {
            files.push(CURRENT_FILES[file]);
          }

          for (let i = 0; i <= files.length; i++) {
            // Go through all 3 upload files
            pt.addAttachment(files[i], function (response) {});
          }

          //selHandler.selectPoint(pt);
          // Hide the form and display thank you message
          $('#pointPopup').hide();

          // show story image and detail
          StoryImageSidePane(results[0].objectId);
          app.ChangeSelectionMode(2);
          app.formSubmittedMessage();
        }
      },
      function (err) {
        alert(err);
      }
    );
  };

  function facebookLinkHandle() {
    const afterhash = window.location.hash.substr(1);

    if (window.location.hash.length > 0) {
      const query = new Query();
      query.returnGeometry = true;
      query.where = '1=1'; // TODO it doesn't like when I search on globalid for some reason
      query.outFields = ['objectid', 'globalid'];

      app.storyPointLayer.queryFeatures(query, function (result) {
        const point = result.features.find(function (feature) {
          return feature.attributes.globalid == afterhash;
        });

        if (point != null) {
          // Make the point look how selectPoint expects
          const pt = {
            graphic: point,
          };

          // Some hackery so I don't have to rewrite the logic of selecting everything
          mapClickHandler({ mapPoint: point.geometry });

          app.CenterAtPoint(point.geometry.x, point.geometry.y);

          // selectHandler.selectPoint(pt);
        }
      });
    }
  }

  /****************************************************************
   * Adds attachment-related utility functions to a point
   ***************************************************************/
  function attachmentifyPoint(pt) {
    if ('attachmentified' in pt && pt.attachmentified) {
      return;
    }
    pt.attachmentified = true;
    pt.featureURL = StoryPointURL + '/' + pt.graphic.attributes.objectid + '/';
    pt.attachURL = pt.featureURL + 'attachments';
    // Gets a list of attachments associated with the point
    pt.getAttachments = function (onRetrieve) {
      if ('attachments' in pt && pt.attachments != null) {
        onRetrieve(pt.attachments);
      } else {
        pt.updateAttachments(onRetrieve);
      }
    };
    // Forces an update of the attachments, even if they were already cached
    pt.updateAttachments = function (onRetrieve) {
      const attachListURL = pt.attachURL + '?f=json';
      $.getJSON(attachListURL).then(function (resp) {
        pt.attachments = resp['attachmentInfos'];
        onRetrieve(pt.attachments);
      });
    };
    pt.addAttachment = function (file, onAdded, filename) {
      pt.featureURL =
        StoryPointURL + '/' + pt.graphic.attributes.objectid + '/';
      pt.attachURL = pt.featureURL + 'attachments';
      var formData = new FormData();
      formData.append('f', 'json');
      if (filename != null) {
        formData.append('attachment', file, filename);
      } else {
        formData.append('attachment', file);
      }
      var request = new XMLHttpRequest();
      request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
          pt.updateAttachments(onAdded);
        }
      };
      request.open('POST', pt.featureURL + 'addAttachment');
      request.send(formData);
    };
  }

  /****************************************************************
   * Custom validity checker for the date input
   ***************************************************************/
  window.dateInvalidityChecker = function (input) {
    const parsedDate = app.parseDateEntry(input.value);
    if (!parsedDate.valid && parsedDate.invalidReason != null) {
      input.setCustomValidity(parsedDate.invalidReason);
    } else if (input.validity.patternMismatch) {
      input.setCustomValidity(
        'Please enter the date in one of the three suggested formats.'
      );
    } else {
      input.setCustomValidity('');
    }
  };

  /****************************************************************
   * date entry validation
   ***************************************************************/
  app.parseDateEntry = function (dateEntry) {
    const response = {
      valid: false,
      invalidReason: null,
      estimated: true,
      beginDate: null,
      endDate: null,
      accuracyLevel: 0,
    };
    const rangeSymbol =
      dateEntry.indexOf('-') !== -1
        ? '-'
        : dateEntry.indexOf('-') !== -1
        ? '-'
        : dateEntry.indexOf('-') !== -1
        ? '-'
        : null;
    if (rangeSymbol != null) {
      const rangeParts = dateEntry.split(rangeSymbol);
      if (rangeParts.length != 2) {
        response.invalidReason =
          "'-' means a date range. Please use the format mm/dd/yyyy for dates.";
        return response;
      }
      let lhs = rangeParts[0].trim();
      let rhs = rangeParts[1].trim();

      const lhsSlashSplit = lhs.split('/');
      const rhsSlashSplit = rhs.split('/');

      if (lhsSlashSplit.length == 3 && rhsSlashSplit.length == 3) {
        response.estimated = false;
        response.accuracyLevel = 3;
      } else if (lhsSlashSplit.length == 2 && rhsSlashSplit.length == 2) {
        response.accuracyLevel = 2;
      } else {
        response.accuracyLevel = 1;
      }

      if (lhsSlashSplit.length == 2) {
        lhs = lhsSlashSplit[0] + '/01/' + lhsSlashSplit[1];
      }
      if (rhsSlashSplit.length == 2) {
        rhs = rhsSlashSplit[0] + '/01/' + rhsSlashSplit[1];
      }

      const beginDateNum = Date.parse(lhs);
      const endDateNum = Date.parse(rhs);
      if (isNaN(beginDateNum) || isNaN(endDateNum)) {
        response.invalidReason =
          'Please enter the date in one of the three suggested formats.';
        return response;
      } else {
        response.beginDate = new Date(beginDateNum);
        response.endDate = new Date(endDateNum);
      }
      if (beginDateNum > Date.now() || endDateNum > Date.now()) {
        response.invalidReason =
          'Looks like that date is in the future. Please enter a date in the past.';
        return response;
      }
    } else {
      const slashSplit = dateEntry.split('/');
      if (slashSplit.length == 3) {
        response.estimated = false;
        response.accuracyLevel = 3;
      } else if (slashSplit.length == 2) {
        dateEntry = slashSplit[0] + '/01/' + slashSplit[1];
        response.accuracyLevel = 2;
      } else {
        response.accuracyLevel = 1;
      }
      const dateNum = Date.parse(dateEntry);
      if (dateNum > Date.now()) {
        response.invalidReason =
          'Looks like that date is in the future. Please enter a date in the past.';
        return response;
      }
      if (isNaN(dateNum)) {
        response.invalidReason =
          'Please enter the date in one of the three suggested formats.';
        return response;
      } else {
        response.beginDate = response.endDate = new Date(dateNum);
      }
    }
    if (response.beginDate == null || response.endDate == null) {
      response.invalidReason =
        'Please enter the date in one of the three suggested formats.';
      return response;
    }
    response.valid = true;
    return response;
  };

  // Handle sidebar close
  window.closeSideBar = function () {
    app.unselectStoryPoint();
    $('#pointPopup').modal('hide');
  };

  // Remove points from map when the modal is closed
  $('#pointPopup').on('hidden.bs.modal', function () {
    app.ChangeSelectionMode(2);
    app.unselectStoryPoint();
  });

  // Close sidebar when escape is pressed
  $(document).bind('keydown', function (e) {
    if (e.keyCode == 27) {
      // 27 = escape
      window.closeSideBar();
      app.ChangeSelectionMode(2);
    }
  });
  app.unselectStoryPoint = function () {
    map.graphics.clear();
  };

  /**
   * Function to load given results taken from the url
   *@param, section, section item is in given from url
   * @param value, index value of item given from url
   * */
  function loadGivenResult(section, value) {
    switch (section) {
      case 'bldg':
        app.RetrieveBldgDetails(value);
        break;
      case 'people':
        app.RetrievePersonDetails(value);
        break;
      case 'place':
        app.RetrievePlaceDetails(value);
        break;
      case 'story':
        app.RetrieveStoryDetails(value);
        break;
    }
  }
});

function setupSearchSelection() {
  $('input[name="searchMode"]').each(function () {
    // console.log(this);

    // Get the ID to refer to the search div by
    var divId = $(this).attr('id').replace(/Mode$/g, 'Search'); // Replace "Mode" at the end with "Search"
    this.searchDiv = $('#' + divId); // Get the search div associated with the selection
    this.btn = $(this.parentElement); // Get the associated button

    var self = this;
    this.btn.click(function () {
      // Update the state of hiddenness
      // Reset the status of all of the other options
      $('input[name="searchMode"]').each(function () {
        this.btn.addClass('btn-default');
        this.btn.removeClass('btn-primary');
        this.searchDiv.hide();
      });

      // Set enabled on the current button
      $(this).addClass('btn-primary');
      $(this).removeClass('btn-default');
      self.searchDiv.show();
    });

    // Only show address search by default
    if ($(this).attr('id') != 'addressMode') {
      this.searchDiv.hide();
    }
  });
}

/**
 *   This function calls imageTagSetter.php using a given story id and urlParams in order to generate a html page that
 *  will be used using a share link to and display an image if their is one associated with the story.
 *  @param storyId, ID of story to get image from
 *  @param urlParams, Parameters that will be given to the share link in order to direct users to the given story when clicked
 *  **/
function getPreviewImage(storyId, urlParams) {
  let hasImage = false;
  //Update image to use story image
  //Get the story object
  var image = '';
  app.storyPointLayer.queryAttachmentInfos(storyId, function (attachments) {
    if (attachments.length !== 0) {
      //loop through and find a image stops on first found image
      for (let i = 0; i < attachments.length; i++) {
        if (attachments[i].contentType.includes('image')) {
          image = attachments[i].url;
          hasImage = true;
          break;
        }
      }
    }
    //make ajax call to create the html mockup for the shared page
    if (hasImage == true) {
      console.log(urlParams);
      $.ajax({
        url:
          'http://geospatialresearch.mtu.edu/kettexplorerapp/imageTagSetter.php?picURL=' +
          image +
          '&altImg=http://geospatialresearch.mtu.edu/kettexplorerapp/fbImages/' +
          app.mapLoc +
          app.mapYear +
          '.PNG' +
          '&urlParams=' +
          urlParams,
        method: 'Post',
        success: function () {
          console.log('Successful story share call');
        },
      });
    } else {
      //Call imageTagSetter using current map location and year as their is no image to display
      $.ajax({
        url:
          'http://geospatialresearch.mtu.edu/kettexplorerapp/imageTagSetter.php?picURL=' +
          'http://geospatialresearch.mtu.edu/kettexplorerapp/fbImages/' +
          app.mapLoc +
          app.mapYear +
          '.PNG' +
          '&altImg=http://geospatialresearch.mtu.edu/kettexplorerapp/fbImages/' +
          app.mapLoc +
          app.mapYear +
          '.PNG' +
          'urlParams=' +
          urlParams,
        method: 'Post',
        success: function () {
          console.log('Succesfully called');
        },
      });
    }
  });
}

/**
 *   This function generates a sharable url
 * */
function generateShareURL() {
  document.getElementById('copySuccess').hidden = true;
  var urlYearsTemp = app.urlYears;
  var urlRecordsTemp = app.urlRecords;
  var urlLocationstemp = app.urlLocations;

  //Set up url that can be shared via copy and paste
  var url = 'http://geospatialresearch.mtu.edu/kettexplorerapp/index.html?';
  var urlParams = '';
  //Adds relevant params to urlParams
  if (app.searchVal !== null && typeof app.searchVal != 'undefined') {
    urlParams += 's=' + app.searchVal; //The search term
  }
  if (app.x !== null && typeof app.x != 'undefined') {
    urlParams += '&x=' + app.x;
  }
  if (app.y !== null && typeof app.y != 'undefined') {
    urlParams += '&y=' + app.y;
  }
  if (app.mapLoc !== null && typeof app.mapLoc != 'undefined') {
    urlParams += '&l=' + app.mapLoc; //maps current location
  }
  if (app.mapYear !== null && typeof app.mapYear != 'undefined') {
    urlParams += '&my=' + app.mapYear; //maps current year
  }
  if (app.result !== null && typeof app.result != 'undefined') {
    urlParams += '&r=' + app.result; //result index
  }
  if (app.section !== null && typeof app.section != 'undefined') {
    urlParams += '&rs=' + app.section; //section
  }
  if (app.storyid !== null && typeof app.storyid != 'undefined') {
    urlParams += '&sid=' + app.storyid; //storyid
  }
  //console.log(app.personid);
  if (app.personid !== null && typeof app.personid != 'undefined') {
    urlParams += '&pid=' + app.personid; //personid
  }
  //Loop through array and add them as string
  if (urlYearsTemp.includes(1)) {
    urlParams += '&yf='; //Yearfilters
    for (let i = 0; i < urlYearsTemp.length; i++) {
      urlParams += urlYearsTemp[i].toString();
    }
  }
  if (urlRecordsTemp.includes(1)) {
    urlParams += '&rf='; //Record filters
    for (let i = 0; i < urlRecordsTemp.length; i++) {
      urlParams += urlRecordsTemp[i].toString();
    }
  }
  if (urlLocationstemp.includes(1)) {
    urlParams += '&lf='; //Location filters
    for (let i = 0; i < urlLocationstemp.length; i++) {
      urlParams += urlLocationstemp[i].toString();
    }
  }

  url += urlParams;

  let modifiedParams = '&';
  modifiedParams += urlParams;

  //Convert the params into a string that doesn't use symbols that cause problems when generating the html pages
  modifiedParams = modifiedParams.replace(/[&\/\\#,+()$~%'":*?<>{}=]/g, '_');

  //Sets up facebook sharing
  if (app.storyid != null) {
    getPreviewImage(app.storyid, modifiedParams);
  } else {
    //If there is no story id the map of the relevant location and year is used as the photo, generates html page
    $.ajax({
      url:
        'http://geospatialresearch.mtu.edu/kettexplorerapp/imageTagSetter.php?picURL=' +
        'http://geospatialresearch.mtu.edu/kettexplorerapp/fbImages/' +
        app.mapLoc +
        app.mapYear +
        '.PNG' +
        '&altImg=http://geospatialresearch.mtu.edu/kettexplorerapp/fbImages/' +
        app.mapLoc +
        app.mapYear +
        '.PNG' +
        '&urlParams=' +
        modifiedParams,
      method: 'Post',
      success: function () {
        //console.log("story map share");
      },
    });
  }

  url =
    'http://geospatialresearch.mtu.edu/kettexplorerapp/shareLinks/' +
    modifiedParams +
    '.html';
  document.getElementById('showUrl').innerHTML = url; //Set shown linkk
  var twitterUrl = 'https://twitter.com/intent/tweet?text='; //Set twitter link
  twitterUrl += encodeURIComponent(url);
  //Set facebook link
  var fbLink =
    'https://www.facebook.com/sharer/sharer.php?u=' +
    url +
    '&amp;src=sdkpreparse';
  document.getElementById('fb').setAttribute('href', fbLink);
  document.getElementById('twitterShare').setAttribute('href', twitterUrl);
  //Opens url holder modal
  $('#urlHolder').modal('show');
}

function callNum() {
  app.addFilterNumber();
}
