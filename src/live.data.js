
var domain = 'gis-core.sabu.mtu.edu';
var port = '6443';
var protocol = "https://";
var arcgisrest = [protocol, domain, ":",port,"/arcgis/rest/services/"].join('');
var portalDomain = 'portal1-geo.sabu.mtu.edu';
var portal = ["https://", portalDomain, ":","6443","/arcgis/rest/services/"].join('');

// used by geocoder,searchPeople
// var khtFSURL = arcgisrest + "KeweenawHSDI/cchsdi_bldgs_forapps/MapServer/0";
// var placeNameURL    = arcgisrest + "KeweenawHSDI/cchsdi_placenames/MapServer/0";
 //var StoryPointURL   = arcgisrest + "KeweenawHSDI/cchsdi_storypts/FeatureServer/0";
// var peopleURL = arcgisrest + "KeweenawHSDI/cchsdi_citydir/MapServer/0";

 var khtFSURL = portal + "KeweenawHSDI/cchsdi_bldgs_forapps/MapServer/0";
 var placeNameURL    = portal + "KeweenawHSDI/cchsdi_placenames/MapServer/0";
 var StoryPointURL   = "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/CCHSDI_StoryPoints_watts/FeatureServer/0";
 var peopleURL = portal + "KeweenawHSDI/KeTT_CityDir/MapServer/0";


//var StoryPointURL   = arcgisrest + 'KeweenawHSDI/cchsdi_storypts/FeatureServer/query?layerDefs={"0":"dateestimated = 1"}';


var searchPhpDomain = 'geospatialresearch.mtu.edu';
// used by searchPeople
var SearchPeopleURL = protocol + searchPhpDomain + "/search_by_person.php";//?q=tivela&p=person
//var SearchPeopleURL = protocol + domain + "/search_by_person.php";//?q=tivela&p=person
var SearchPlaceURL  = protocol + searchPhpDomain + "/search_by_place.php";//?q=place&p=place;
var SearchStoryURL  = protocol + searchPhpDomain + "/search_by_story.php";//?q=place&p=story
//Used for testing
var TestURL = protocol + searchPhpDomain +"/testSearch.php";
var IdTestUrl = protocol + searchPhpDomain + "/testIdSearch.php";
// used by geocoder
var phpSearchByIdURL = protocol + searchPhpDomain + "/search_by_id.php";
var demographicURL = protocol + searchPhpDomain + "/demographic.php";
//var phpSearchByIdURL = protocol + domain + "/search_by_id.php";
//var phpSearchByIdURL = "http://gis-core.sabu.mtu.edu/search_by_id.php";


var kettTopoMapServerURL = "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1940s_TOPO/MapServer";

var kettAllInOneByYears = ['1888','1900','1908','1917','1928','1935','1942','1949'];
var kettAllInOneByYearPattern = "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_YYYY_FIPS/MapServer";

var debugLevel = 'prerelease';//'debug' // debug, release

var KeTT_Geocoders = [
         "KeTT_Geocoder_1949",
         "KeTT_Geocoder_1942",
         "KeTT_Geocoder_1935",
         "KeTT_Geocoder_1928",
         "KeTT_Geocoder_1917",
         "KeTT_Geocoder_190708",
         "KeTT_Geocoder_1900",
         "KeTT_Geocoder_1888"];
var GeocoderRootUrl = portal;

var validServiceConfig = null;
// tiled map services

// var locationInfo = { Locations : [
// 		{
// 			name:"Atlantic Mine",
// 			value:"AtlanticMine",
// 			hasColor: true,
// 			center:[{x: -9865858.848229574, y:5958405.768294633}]
// 		},
// 		{
// 			name: "Calumet",
// 			value: "Calumet",
// 			hasColor: true,
// 			center: [{x: -9846662.3455, y: 5982448.0482}]
// 		},
// 		{
// 			name:"Dollar Bay",
// 			value:"DollarBar",
// 			hasColor: true,
// 			center:[{x: -9852035.1578, y:5961648.7522}]
// 		},
// 		{
// 			name:"Hancock",
// 			value:"Hancock",
// 			hasColor: true,
// 			center:[{x: -9860765.5904, y:5962775.4182}]
// 		},
// 		{
// 			name: "Houghton",
// 			value:"Houghton",
// 			hasColor: true,
// 			center: [{x: -9859353.5877, y:5961980.4714}]
// 		},
// 		{
// 			name:"Lake Linden",
// 			value:"LakeLinden",
// 			hasColor: true,
// 			center:[{x: -9841696.5644, y:5973452.658}]
// 		},
// 		{
// 			name:"Laurium",
// 			value:"Laurium",
// 			hasColor: true,
// 			center:[{x: -9845522.658, y:5980860.6264}]
// 		},
// 		{
// 			name: "Mohawk",
// 			value:"Mohawk",
// 			hasColor: true,
// 			center:[{x: -9836527.2678, y:5991687.6573}]
// 		},
// 		{
// 			name:"Quincy",
// 			value:"Quincy",
// 			hasColor: true,
// 			center:[{x: -9860501.4074, y:5963928.1271}]
// 		},
// 		{
// 			name:"South Houghton County",
// 			value:"SouthHoughtonCounty",
// 			hasColor: true,
// 			center:[{x: -9866592.9165, y:5952530.2375}]
// 		},
// 		{
// 			name:"South Range",
// 			value:"SourhRange",
// 			hasColor: true,
// 			center:[{x: -9867820.9973, y:5953686.6803}]
// 		}
//
//
// 	]
// }

var kht = {Services:[
	{	id: "AtlanticMine_1949",
		name:"Atlantic Mine",  year:"1949", value:"AtlanticMine", hasColor:true,
		mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1949_FIPS/MapServer"
	},
   {	id: "Calumet_1949",
		name:"Calumet",  year:"1949", value:"Calumet",hasColor:true,
         mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1949_FIPS/MapServer"
	},{	id: "Calumet_1942",
		name:"Calumet",  year:"1942", value:"Calumet", hasColor:false,
        mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1942_FIPS/MapServer"
	},{	id: "Calumet_1928",
		name:"Calumet",  year:"1928", value:"Calumet",hasColor:false,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1928_FIPS/MapServer"
	},{	id: "Calumet_1917",
		name:"Calumet",  year:"1917", value:"Calumet",hasColor:true,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1917_FIPS/MapServer"
	},{	id: "Calumet_1908",
		name:"Calumet",  year:"1908", value:"Calumet",hasColor:true,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1908_FIPS/MapServer"
	},{	id: "Calumet_1900",
		name:"Calumet",  year:"1900", value:"Calumet",hasColor:true,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1900_FIPS/MapServer"
	},{	id: "Calumet_1888",
		name:"Calumet",  year:"1888", value:"Calumet",hasColor:true,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1888_FIPS/MapServer"
	},{	id: "Calumet_1884",
		name:"Calumet",  year:"1884", value:"Calumet",hasColor:true,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1888_FIPS/MapServer"
	},
   {  id: "DollarBay_1907",
		name:"Dollar Bay",   year:"1907", value:"DollarBay",hasColor:true,
		mapservice:       "https://gis-core.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/DoB07_FIPS/MapServer"
   },
   {  id: "DollarBay_1917",
		name:"Dollar Bay",   year:"1917", value:"DollarBay",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1917_FIPS/MapServer"
   },
   {  id: "DollarBay_1928",
		name:"Dollar Bay",   year:"1928", value:"DollarBay",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1928_FIPS/MapServer"
   },
   {  id: "DollarBay_1942",
		name:"Dollar Bay",   year:"1942", value:"DollarBay",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1942_FIPS/MapServer"
   },
   {  id: "DollarBay_1949",
		name:"Dollar Bay",   year:"1949", value:"DollarBay",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1949_FIPS/MapServer"
   },
   {  id: "Hancock_1949",
		name:"Hancock",   year:"1949", value:"Hancock",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1949_FIPS/MapServer"
   },{
      id: "Hancock_1942",
		name:"Hancock",   year:"1942", value:"Hancock",hasColor:true,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1942_FIPS/MapServer"
   },{
      id: "Hancock_1928",
		name:"Hancock",   year:"1928", value:"Hancock",hasColor:false,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1928_FIPS/MapServer"
   },{
      id: "Hancock_1917",
		name:"Hancock",   year:"1917", value:"Hancock",hasColor:true,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1917_FIPS/MapServer"
   },{
      id: "Hancock_1907",
		name:"Hancock",   year:"1907", value:"Hancock",hasColor:false,
		mapservice:       "https://gis-core.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/Hck07FIPS/MapServer"
   },{
      id: "Hancock_1900",
		name:"Hancock",   year:"1900", value:"Hancock",hasColor:false,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1900_FIPS/MapServer"
   },{
      id: "Hancock_1888",
		name:"Hancock",   year:"1888", value:"Hancock",hasColor:true,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1888_FIPS/MapServer"
   },
   {  id: "Houghton_1949",
		name:"Houghton",  year:"1949",  value:"Houghton", hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1949_FIPS/MapServer"
	},{
		id: "Houghton_1928",
		name:"Houghton",  year:"1928",  value:"Houghton", hasColor:false,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1928_FIPS/MapServer"
	},{
		id: "Houghton_1917",
		name:"Houghton",  year:"1917",  value:"Houghton", hasColor:false,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1917_FIPS/MapServer"
	},{
		id: "Houghton_1908",
		name:"Houghton",  year:"1908",  value:"Houghton", hasColor:true,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1908_FIPS/MapServer"
	},{
		id: "Houghton_1900",
		name:"Houghton",  year:"1900",  value:"Houghton",	hasColor:false,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1900_FIPS/MapServer"
	},{
		id: "Houghton_1888",
		name:"Houghton",  year:"1888",  value:"Houghton",	hasColor:true,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1888_FIPS/MapServer"
	},
   {
		id: "LakeLinden_1935",
		name:"Lake Linden",  year:"1935", value:"LakeLinden", hasColor:true,
		mapservice:       "https://gis-core.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/LL35FIPS/MapServer"
	},{
		id: "LakeLinden_1928",
		name:"Lake Linden",  year:"1928", value:"LakeLinden", hasColor:false,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1928_FIPS/MapServer"
	},{
		id: "LakeLinden_1917",
		name:"Lake Linden",  year:"1917", value:"LakeLinden", hasColor:false,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1917_FIPS/MapServer"
	},{
		id: "LakeLinden_1908",
		name:"Lake Linden",  year:"1908", value:"LakeLinden", hasColor:false,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1908_FIPS/MapServer"
	},{
		id: "LakeLinden_1900",
		name:"Lake Linden",  year:"1900", value:"LakeLinden", hasColor:false,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1900_FIPS/MapServer"
	},{
		id: "LakeLinden_1888",
		name:"Lake Linden",  year:"1888", value:"LakeLinden", hasColor:true,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1888_FIPS/MapServer"
        },
   {	id: "Laurium_1949",
		name:"Laurium",  year:"1949", value:"Laurium",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1949_FIPS/MapServer"
	},{
		id: "Laurium_1942",
		name:"Laurium",  year:"1942", value:"Laurium",hasColor:false,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1942_FIPS/MapServer"
	},{
		id: "Laurium_1917",
		name:"Laurium",  year:"1917", value:"Laurium",hasColor:false,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1917_FIPS/MapServer"
	},{
		id: "Laurium_1908",
		name:"Laurium",  year:"1908", value:"Laurium",hasColor:true,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1908_FIPS/MapServer"
	},{
		id: "Laurium_1900",
		name:"Laurium",  year:"1900", value:"Laurium",hasColor:true,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1900_FIPS/MapServer"
	},{
		id: "Laurium_1888",
		name:"Laurium",  year:"1888", value:"Laurium",hasColor:true,
            mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1888_FIPS/MapServer"
	},
   {	id: "Mohawk_1949",
		name:"Mohawk",  year:"1949", value:"Mohawk",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1949_FIPS/MapServer"
	},
   {	id: "Quincy_1883",
		name:"Quincy",  year:"1883", value:"Quincy",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1888_FIPS/MapServer"
	},
   {	id: "Quincy_1888",
		name:"Quincy",  year:"1888", value:"Quincy",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1888_FIPS/MapServer"
	},
   {	id: "Quincy_1900",
		name:"Quincy",  year:"1900", value:"Quincy",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1900_FIPS/MapServer"
   },
   {	id: "Quincy_1907",
		name:"Quincy",  year:"1907", value:"Quincy",hasColor:true,
		mapservice:       "https://gis-core.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/Qcy07_FIPS/MapServer"
	},
   {	id: "Quincy_1917",
		name:"Quincy",  year:"1917", value:"Quincy",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1917_FIPS/MapServer"
	},
   {	id: "Quincy_1928",
		name:"Quincy",  year:"1928", value:"Quincy",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1928_FIPS/MapServer"
	},
   {	id: "Quincy_1942",
		name:"Quincy",  year:"1942", value:"Quincy",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1942_FIPS/MapServer"
	},
   {	id: "Quincy_1949",
		name:"Quincy",  year:"1949", value:"Quincy",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1949_FIPS/MapServer"
	},
   {	id: "SouthHoughtonCounty_1949",
		name:"South Houghton County",  year:"1949", value:"SouthHoughtonCounty",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1949_FIPS/MapServer"
	},
   {	id: "SouthRange_1949",
		name:"South Range",  year:"1949", value:"SouthRange",hasColor:true,
       mapservice:       "https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_1949_FIPS/MapServer"
	}

]};

var decadeBin = {Services:[
	{
		label:"1880s",  startYear: 1875 , endYear: 1889,
		townservice:[
      {name:"Calumet",     year: 1888, mapservice:"Cal88FIPS"},
      {name:"Houghton",    year: 1888, mapservice:"Htn88_FIPS"},
      {name:"Laurium",     year: 1888, mapservice:"Laurium88FIPS"},
      {name:"Lake Linden", year: 1885, mapservice:"LL1885FIPS"},
      {name:"Quincy",      year: 1883, mapservice:"Quincy1883"},
      {name:"Hancock",     year: 1888, mapservice:"Hck88_FIPS"},
      {name:"Mohawk",      year: 0,    mapservice:""},
      {name:"Dollar Bay",  year: 0,    mapservice:""},
      {name:"South Houghton County",   year: 0, mapservice:""},
      {name:"South Range",             year: 0, mapservice:""},
      ]
	},
   {
      label:"1890s",  startYear: 1890 , endYear: 1898,
		townservice:[
      {name:"Calumet",     year: 1893},
      {name:"Houghton",    year: 1888},
      {name:"Laurium",     year: 1888},
      {name:"Lake Linden", year: 1893},
      {name:"Quincy",      year: 1888},
      {name:"Hancock",     year: 0},
      {name:"Mohawk",      year: 0},
      {name:"Dollar Bay",  year: 0},
      {name:"South Houghton County"},
      {name:"South Range",year: 0},
      ]
	} ,
   {
      label:"1900s",  startYear: 1899 , endYear: 1913,
		townservice:[
      {name:"Calumet",     year: 1908},
      {name:"Houghton",    year: 1900},
      {name:"Laurium",     year: 1900},
      {name:"Lake Linden", year: 1900},
      {name:"Quincy",      year: 1907},
      {name:"Hancock",     year: 1907},
      {name:"Mohawk",      year: 0},
      {name:"Dollar Bay",  year: 1907},
      {name:"South Houghton County",year: 0},
      {name:"South Range",year: 0},
      ]
	} ,
   {
      label:"1910s",  startYear: 1914 , endYear: 1924,
		townservice:[
      {name:"Calumet",     year: 1917},
      {name:"Houghton",    year: 1917},
      {name:"Laurium",     year: 1917},
      {name:"Lake Linden", year: 1917},
      {name:"Quincy",      year: 1917},
      {name:"Hancock",     year: 1917},
      {name:"Mohawk",      year: 0},
      {name:"Dollar Bay",  year: 1917},
      {name:"South Houghton County",year: 0},
      {name:"South Range",year: 0},
      ]
	},
   {
      label:"1920s",  startYear: 1925 , endYear: 1938,
		townservice:[
      {name:"Calumet",     year: 1928},
      {name:"Houghton",    year: 1928},
      {name:"Laurium",     year: 1917},
      {name:"Lake Linden", year: 1928},
      {name:"Quincy",      year: 1928},
      {name:"Hancock",     year: 1928},
      {name:"Mohawk",      year: 0},
      {name:"Dollar Bay",  year: 1928},
      {name:"South Houghton County",year: 0},
      {name:"South Range",year: 0},
      ]
	} ,
   {
      label:"1930s",  startYear: 1939 , endYear: 1945,
		townservice:[
      {name:"Calumet",     year: 1942},
      {name:"Houghton",    year: 1949},
      {name:"Laurium",     year: 1942},
      {name:"Lake Linden", year: 1935},
      {name:"Quincy",      year: 1942},
      {name:"Hancock",     year: 1942},
      {name:"Mohawk",      year: 0},
      {name:"Dollar Bay",  year: 1942},
      {name:"South Houghton County",year: 0},
      {name:"South Range",year: 0},
      ]
	} ,
   {
      label:"1940-50s",  startYear: 1946 , endYear: 1955,
		townservice:[
      {name:"Calumet",     year: 1949},
      {name:"Houghton",    year: 1949},
      {name:"Laurium",     year: 1949},
      {name:"Lake Linden", year: 1935},
      {name:"Quincy",      year: 1949},
      {name:"Hancock",     year: 1949},
      {name:"Mohawk",      year: 1949},
      {name:"Dollar Bay",  year: 0},
      {name:"South Houghton County",year: 1949},
      {name:"South Range",year: 1949},
      ]
	}
	]};


   var townCentroid = {centroids:[
      {name:"Atlantic Mine",     x: -9865858.848229574, y:5958405.768294633},
      {name:"Calumet",     x: -9846662.3455, y:5982448.0482},
      {name:"Dollar Bay",     x: -9852035.1578, y:5961648.7522},
      {name:"Hancock",     x: -9860765.5904, y:5962775.4182},
      {name:"Houghton",     x: -9859353.5877, y:5961980.4714},
      {name:"Lake Linden",     x: -9841696.5644, y:5973452.658},
      {name:"Laurium",     x: -9845522.658, y:5980860.6264},
      {name:"Mohawk",     x: -9836527.2678, y:5991687.6573},
      {name:"Quincy",     x: -9860501.4074, y:5963928.1271},
      {name:"South Houghton County",     x: -9866592.9165, y:5952530.2375},
      {name:"South Range",     x: -9867820.9973, y:5953686.6803}
	]};

