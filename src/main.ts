const JourneyIFrameClient = require('journey-iframe-client');
const $ = require('jquery');
(window as any).$ = $;
(window as any).jQuery = $;
require('bootstrap');
// require('./vendor/colorpicker');
// require('spectrum-colorpicker');
require('./vendor/annotate');
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
// import '../node_modules/spectrum-colorpicker/spectrum.css';

import './sass/main.scss';

const journeyIFrameClient = new JourneyIFrameClient();

journeyIFrameClient.on('loadImage', function (image) {
        var selectedColor = "#000000";

        $('#myCanvas').annotate({
            color: selectedColor,
            linewidth: 4,
            bootstrap: true,
            images: [`data:image/jpeg;base64,${image}`],
            selectEvent: "changeColor",
            onExport: function(image) {
                journeyIFrameClient.post('image-annotated', image);
            },
            showPalette: false
        });
});

$(document).ready(function(){
    $("#save-image").click(function(event) {
        $('#myCanvas').annotate("export", {type: "image/jpeg", quality: 1.0}, function(){
            console.log("Exporting");
        });
    });

});
