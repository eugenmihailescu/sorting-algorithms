// toBlob polyfill
if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value : function(callback, type, quality) {

            var binStr = atob(this.toDataURL(type, quality).split(',')[1]), len = binStr.length, arr = new Uint8Array(len);

            for (var i = 0; i < len; i++) {
                arr[i] = binStr.charCodeAt(i);
            }

            callback(new Blob([ arr ], {
                type : type || 'image/png'
            }));
        }
    });
}

/**
 * Save the current SVG to file
 * 
 * @param {object}
 *            svg - The SVG element
 * @param {object} $ -
 *            A reference to jQuery
 */
function ChartExport(svg, $) {
    this.sender = null;
    this.workerCount = $("#runinpage").prop("checked") ? 0 : $("#jobs").val();
    this.itemsType = $("#itemtype").val();
    this.itemsCount = $("input#itemcount").val();

    var that = this;

    // 96DPI/72PPI
    var scaleFactorX = 96 / 72;
    var scaleFactorY = 96 / 72;

    var svgClass = "class_" + String(Math.random()).split(".").pop();
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    var svgSize = svg.getBoundingClientRect();
    canvas.width = svgSize.width;
    canvas.height = svgSize.height;
    svg = $(svg);

    /**
     * Calculate the text width based on its font size
     */
    var getTextWidth = function(text, font) {
        font && (context.font = font);
        var metrics = context.measureText(text);

        return metrics.width;
    };

    /**
     * Get info about the current browser
     * 
     * @returns {object} - Returns an object with some properties of running browser
     */
    var getNavigator = function() {
        var prop = [ "appName", "userAgent", "platform", "hardwareConcurrency", "platform" ], result = {};
        for (var i = 0; i < prop.length; i += 1) {
            if (navigator[prop[i]]) {
                result[prop[i]] = navigator[prop[i]];
            } else {
                result[prop[i]] = false;
            }
        }

        if (result.userAgent) {
            result.userAgent = result.userAgent.split(" ").pop();
        }

        if (result.hardwareConcurrency) {
            result.hardwareConcurrency += "CPU";
        }
        return result;
    };

    /**
     * Append a link element to the SVG
     * 
     * @param {array|string=}
     *            text - The text to create or an array of texts
     * @param {string=}
     *            align - left|right. Default `left`.
     * @param {int=}
     *            fontSize - The font size in pixels. Default to SVG element.
     * @param {int=}
     *            line - The line number (starting with 1=top). When `text` is an array then the array's item index is used
     *            instead.
     */
    var addWatermark = function(text, align, fontSize, line) {
        line = line || 1;
        text = text || "";

        if ("Array" != text.constructor.name) {
            text = [ text ];
        }

        align = align || "left";
        fontSize = fontSize || that.sender.stripPixel(svg.css("font-size"));
        var fontFamily = svg.css("font-family");
        var svgWidth = svg.attr("width");

        for (var i = 0; i < text.length; i += 1) {
            if (text.length > 1) {
                line = i + 1;
            }

            // make it 2-chars longer
            var textSize = getTextWidth("__" + text[i], fontSize + "px " + fontFamily);

            // assuming a font of 12px
            var textHeight = fontSize * scaleFactorY;
            var x = 0, y = 0;

            switch (align) {
            case "right":
                x = that.sender.stripPixel(svgWidth) - textSize / scaleFactorX;
                break;
            default:
                // pad-left=1char
                x = textSize / text[i].length;
                break;
            }

            y = (line) * textHeight;

            var txt = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'));

            txt.attr("x", x);
            txt.attr("y", y);
            txt.attr("font-size", fontSize);
            text.length && txt.text(text[i]);
            txt.attr("class", svgClass);
            txt.attr("fill", "#708090");
            txt.appendTo(svg);
        }
    };

    /**
     * Save to PNG|SVG
     * 
     * @params {callback} promise - A promise that should be fullfiled as soon the PNG|SVG is accesible
     */
    var saveAs = {
        dataPNG : function(promise) {
            var svgData = new XMLSerializer().serializeToString(svg.get(0));

            var img = document.createElement("img");
            img.setAttribute("src", "data:image/svg+xml;base64," + btoa(svgData));

            img.onload = function() {
                context.drawImage(img, 0, 0);

                if ("undefined" != typeof HTMLCanvasElement.prototype.toBlob) {
                    canvas.toBlob(function(blob) {
                        promise && promise({
                            type : "image/png",
                            blob : blob,
                            ext : "png"
                        });
                    });
                }
            };

        },
        dataSVG : function(promise) {
            var blob = new Blob([ svg.get(0).outerHTML ], {
                type : "image/svg+xml;charset=utf-8"
            });

            promise && promise({
                type : "image/svg+xml;charset=utf-8",
                blob : blob,
                ext : "svg"
            });
        }
    };

    /**
     * Save the SVG to the file in the specified format
     * 
     * @param {string=}
     *            format - The image format (svg|png). Default to `svg`.
     * @param {string=}
     *            filename - The name of the local saved file
     */
    this.exportChart = function(format, filename) {
        format = format || "svg";

        // add our watermark
        var browser = getNavigator();
        var totalTime = that.sender.getExecTime();
        var suffix = totalTime > 1000 ? "s" : "";
        var xtime = that.sender.getTimeFormat(Math.round(totalTime / (totalTime > 1000 ? 1000 : 1)), suffix)
        var xCPU = that.workerCount ? that.workerCount + "CPU" : "1UI";
        var xSample = that.sender.exectimes.length > 1 ? that.sender.exectimes.length + " x " : "";

        var watermark = [];

        if (screen.width >= 480 || screen.height > 480) {
            watermark.push(window.location);
        }

        watermark.push(browser.appName + " " + browser.userAgent + " (" + browser.platform + ", "
                + browser.hardwareConcurrency + ")");
        watermark.push(xSample + that.itemsType + " array[" + that.itemsCount + "] @ " + xCPU + " ~ " + xtime);

        addWatermark(watermark, "right", 12);
        addWatermark(that.sender.jsLibURL, "left", 12, canvas.height / (scaleFactorY * 12) - 0.5);

        /**
         * A callback that is automatically executed after the PNG|SVG has been produced
         * 
         * @param {object}
         *            data - An object containing the PNG|SVG blob
         */
        var promise = function(data) {
            data.blob.lastModified = new Date();
            data.blob.name = filename ? filename : ("file." + data.ext);

            var downloadLink = document.createElement("a");

            if ("undefined" != typeof URL) {
                downloadLink.href = URL.createObjectURL(data.blob);
            }
            downloadLink.download = data.blob.name;
            document.body.appendChild(downloadLink);

            downloadLink.click();

            // clean-up
            document.body.removeChild(downloadLink);
            $("." + svgClass).remove();
        };

        saveAs["data" + format.toUpperCase()].call(saveAs, promise);
    }
};