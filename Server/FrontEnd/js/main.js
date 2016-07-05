/**
 * Created by tasu on 04.07.16.
 */
var socket=io.connect();

    window.onload = function() {

      var sm = new scribblemaps.ScribbleMap('ScribbleMap', {
                searchControl: true,
                lineSettingsControl: true,
                mapTypeControl: true,
                fillColorControl: true,
                lineColorControl: true,
                zoomControl: true,
                tools: ["menu", "edit", "drag", "eraser", "fill",
                        "scribble", "line", "flightLine", "rectangle", "circle",
                        "polygon", "label", "marker", "image"],
                defaultTool: "edit",
                startCenter: [43.00, -82.36116582031251],
                startZoom: 7,
                startMapType: "hybrid",
                disableZoom: false
            });

                  



    }

