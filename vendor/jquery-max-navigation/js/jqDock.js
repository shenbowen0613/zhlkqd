/*jQuery plugin : jqDock v1.2 */
;(function ($) {
    if (!$.fn.jqDock) {
        var jqDock = function () {
            return {
                version: 1.2,
                defaults: {
                    size: 36,
                    distance: 54,
                    coefficient: 1.5,
                    duration: 500,
                    align: 'bottom',
                    labels: false,
                    source: false,
                    loader: null
                },
                useJqLoader: $.support.opera || $.support.safari,
                shrinkInterval: 100,
                docks: [],
                X: 0,
                Y: 0,
                verthorz: {
                    v: {wh: 'height', xy: 'Y', tl: 'top', lead: 'Top', trail: 'Bottom', act: 'ActualInv'},
                    h: {wh: 'width', xy: 'X', tl: 'left', lead: 'Left', trail: 'Right', act: 'Actual'}
                },
                elementCss: {position: 'relative', borderWidth: 0, borderStyle: 'none', verticalAlign: 'top'},
                vanillaDiv: '<div id="jq_dock_id" style="position:relative;margin:0px auto;padding:0px;border:0px none;background-color:transparent;">',
                initDock: function (id) {
                    var ME = this, Dock = this.docks[id], op = Dock.Opts, off = 0, AI = $('a, img', Dock.Menu), i = 0, j, el, wh, acc, upad, opPre95 = ($.support.opera && (1 * ($.support.version.match(/^(\d+\.\d+)/) || [0, 0])[1]) < 9.5);
                    this.removeText(Dock.Menu);
                    if (op.orient.vh == 'h') {
                        AI.css(this.elementCss);
                        if (opPre95 || !$.boxModel) {
                            AI.filter('a').css({lineHeight: 0, fontSize: '0px'})
                        } else {
                            var hcss = {display: 'block'};
                            hcss['float'] = 'left';
                            AI.filter('img').css(hcss)
                        }
                    } else {
                        AI.not($('a img', Dock.Menu)).wrap(this.vanillaDiv + '</div>').end().css(this.elementCss).css({display: 'block'})
                    }
                    while (i < Dock.Elem.length) {
                        el = Dock.Elem[i++];
                        wh = this.keepProportion(el, op.size, {vh: op.orient.inv, inv: op.orient.vh});
                        el.Actual = el.Final = el.Initial = wh[op.vh.wh];
                        el.SizeDiff = el[op.vh.wh] - el.Initial;
                        el.Img.css(wh);
                        el.Img.removeAttr('title').attr({alt: ''}).parent('a').removeAttr('title');
                        el.ShrinkStep = Math.floor(el.SizeDiff * this.shrinkInterval / op.duration);
                        Dock[op.vh.inv.wh] = Math.max(Dock[op.vh.inv.wh], op.size + el.Pad[op.vh.inv.lead] + el.Pad[op.vh.inv.trail]);
                        el.Offset = off;
                        el.Centre = el.Offset + el.Pad[op.vh.lead] + (el.Initial / 2);
                        off += el.Initial + el.Pad[op.vh.lead] + el.Pad[op.vh.trail]
                    }
                    i = 0;
                    while (i < Dock.Elem.length) {
                        el = Dock.Elem[i++];
                        acc = 0;
                        upad = el.Pad[op.vh.lead] + el.Pad[op.vh.trail];
                        Dock.Spread += el.Initial + upad;
                        this.setSizes(id, el.Centre);
                        j = Dock.Elem.length;
                        while (j) {
                            acc += Dock.Elem[--j].Final + upad
                        }
                        Dock[op.vh.wh] = Math.max(Dock[op.vh.wh], acc)
                    }
                    while (i) {
                        el = Dock.Elem[--i];
                        el.Final = el.Initial
                    }
                    var wrap = [this.vanillaDiv, '<div class="jqDock" style="position:absolute;bottom:5px;left:0px;padding:0px;', 'margin:0px;overflow:visible;height:', Dock.height-10, 'px;width:', Dock.width, 'px;"></div></div><div style="clear: both;"></div>'].join('');
                    Dock.Yard = $(Dock.Menu).wrapInner(wrap).find('div.jqDock');
                    $.each([op.vh.lead, op.vh.trail], function (n, v) {
                        Dock.Borders[v] = ME.asNumber(Dock.Yard.css('border' + v + 'Width'))
                    });
                    if (Dock.Borders[op.vh.lead]) {
                        Dock.Yard.css(op.vh.tl, Math.ceil(Dock.Borders[op.vh.lead] / 2))
                    }
                    while (i < Dock.Elem.length) {
                        el = Dock.Elem[i];
                        this.changeSize(id, i, el.Final, true);
                        el.Img.addClass('jqDockMouse' + id + '_' + (i++))
                    }
                    $(Dock.Menu).show();
                    $("#jq_dock_id").css("width",Dock.width); //设置宽度
                    $("#jq_dock_id").css("height",Dock.height*(0.6)); //高度
                    if (Dock.Opts.labels) {
                        $.each(Dock.Elem, function (i) {
                            ME.setLabel(id, this.Label)
                        });
                        Dock.Label.hide()
                    }
                    Dock.Yard.bind('mouseover mouseout mousemove', function (e) {
                        ME.mouseHandler(e)
                    })
                },
                altImage: function () {
                    var alt = $(this).attr('alt');
                    return (alt && alt.match(/\.(gif|jpg|jpeg|png)$/i)) ? alt : false
                },
                removeText: function (el) {
                    var i = el.childNodes.length, j;
                    while (i) {
                        j = el.childNodes[--i];
                        if (j.childNodes && j.childNodes.length) {
                            this.removeText(j)
                        } else if (j.nodeType == 3) {
                            el.removeChild(j)
                        }
                    }
                },
                asNumber: function (x) {
                    var r = parseInt(x, 10);
                    return isNaN(r) ? 0 : r
                },
                keepProportion: function (el, dim, orient) {
                    var r = {}, vh = this.verthorz[orient.vh], inv = this.verthorz[orient.inv];
                    r[vh.wh] = dim;
                    r[inv.wh] = Math.round(dim * el[inv.wh] / el[vh.wh]);
                    return r
                },
                deltaXY: function (id) {
                    var Dock = this.docks[id];
                    if (Dock.Current !== false) {
                        var op = Dock.Opts, el = Dock.Elem[Dock.Current], p = el.Pad[op.vh.lead] + el.Pad[op.vh.trail], off = el.Img.offset();
                        Dock.Delta = Math.floor((this[op.vh.xy] - off[op.vh.tl]) * (p + el.Initial) / (p + el.Actual)) + el.Offset;
                        this.doLabel(id, off)
                    }
                },
                setLabel: function (id, label) {
                    var Dock = this.docks[id], ME = this, pad = {};
                    if (!Dock.Label) {
                        Dock.Label = $('<div class="jqDockLabel jqDockMouse' + id + '_00 jqDockLabelImage" style="position:absolute;margin:0px;"></div>').hide().bind('click', function () {
                            Dock.Elem[Dock.Current].Img.trigger('click')
                        }).appendTo(Dock.Yard)
                    }
                    if (label.txt) {
                        Dock.Label.text(label.txt);
                        $.each(['Top', 'Right', 'Bottom', 'Left'], function (n, v) {
                            pad[v] = ME.asNumber(Dock.Label.css('padding' + v))
                        });
                        $.each(this.verthorz, function (vh, o) {
                            label[o.wh] = Dock.Label[o.wh]();
                            label[o.wh + 'Pad'] = pad[o.lead] + pad[o.trail]
                        })
                    }
                },
                doLabel: function (id, off) {
                    var Dock = this.docks[id];
                    if (Dock.Opts.labels && Dock.Current !== false) {
                        var el = Dock.Elem[Dock.Current], L = el.Label, op = Dock.Opts, what = typeof off == 'string' ? off : 'move';
                        switch (what) {
                            case'show':
                            case'hide':
                                Dock.Label[L.txt ? what : 'hide']();
                                break;
                            case'change':
                                Dock.Label[0].className = Dock.Label[0].className.replace(/(jqDockLabel)(Link|Image)/, '$1' + (el.Linked ? 'Link' : 'Image'));
                                Dock.Label.text(L.txt).css({ height: L.height}).hide();
                                break;
                            default:
                                var doff = Dock.Yard.offset(), css = {
                                    top: off.top - doff.top,
                                    left: off.left - doff.left
                                }, splt = op.labels.split('');
                                if (splt[0] == 'm') {
                                    css.top += Math.floor((el[op.vh.inv.act] - L.height - L.heightPad) / 2)
                                } else if (splt[0] == 'b') {
                                    css.top += el[op.vh.inv.act] + el.Pad.Top + el.Pad.Bottom - L.height - L.heightPad
                                }
                                if (splt[1] == 'c') {
                                    css.left += Math.floor((el[op.vh.act] - L.width - L.widthPad) / 2)
                                } else if (splt[1] == 'r') {
                                    css.left += el[op.vh.act] + el.Pad.Left + el.Pad.Right - L.width - L.widthPad
                                }
                                Dock.Label.css(css)
                        }
                    }
                },
                mouseHandler: function (e) {
                    var r = null, t = e.target.className.match(/jqDockMouse(\d+)_(\d+)/), rt = !!(e.relatedTarget) && e.relatedTarget.tagName !== undefined;
                    if (t) {
                        r = false;
                        var id = 1 * t[1], Dock = this.docks[id], idx = t[2] == '00' ? Dock.Current : 1 * t[2];
                        this.X = e.pageX;
                        this.Y = e.pageY;
                        if (e.type == 'mousemove') {
                            if (idx == Dock.Current) {
                                this.deltaXY(id);
                                if (Dock.OnDock && Dock.Expanded) {
                                    this.setSizes(id);
                                    this.factorSizes(id)
                                }
                            }
                        } else {
                            var rel = rt && e.relatedTarget.className.match(/jqDockMouse(\d+)_(\d+)/);
                            if (e.type == 'mouseover' && (!Dock.OnDock || idx !== Dock.Current)) {
                                Dock.Current = idx;
                                this.doLabel(id, 'change');
                                this.deltaXY(id);
                                if (Dock.Expanded) {
                                    this.doLabel(id, 'show')
                                }
                                if (rt && (!rel || rel[1] != id)) {
                                    Dock.Timestamp = (new Date()).getTime();
                                    this.setSizes(id);
                                    Dock.OnDock = true;
                                    this.overDock(id)
                                }
                            } else if (rt && e.type == 'mouseout') {
                                if (!rel || rel[1] != id) {
                                    Dock.OnDock = false;
                                    this.doLabel(id, 'hide');
                                    var i = Dock.Elem.length;
                                    while ((i--)) {
                                        Dock.Elem[i].Final = Dock.Elem[i].Intial
                                    }
                                    this.offDock(id)
                                }
                            }
                        }
                    }
                    return r
                },
                overDock: function (id) {
                    var Dock = this.docks[id];
                    if (Dock.OnDock) {
                        var ME = this, el = Dock.Elem, i = el.length;
                        while ((i--) && !(el[i].Actual < el[i].Final)) {
                        }
                        if (i < 0) {
                            Dock.Expanded = true;
                            this.deltaXY(id);
                            this.doLabel(id, 'show')
                        } else {
                            this.setSizes(id);
                            this.factorSizes(id);
                            setTimeout(function () {
                                ME.overDock(id)
                            }, 60)
                        }
                    }
                },
                offDock: function (id) {
                    var Dock = this.docks[id];
                    if (!Dock.OnDock) {
                        var ME = this, done = true, i = Dock.Elem.length, el, sz;
                        while (i) {
                            el = Dock.Elem[--i];
                            if (el.Actual > el.Initial) {
                                sz = el.Actual - el.ShrinkStep;
                                if (sz > el.Initial) {
                                    done = false
                                } else {
                                    sz = el.Initial
                                }
                                this.changeSize(id, i, sz)
                            }
                        }
                        this.deltaXY(id);
                        if (done) {
                            while (i < Dock.Elem.length) {
                                el = Dock.Elem[i++];
                                el.Actual = el.Final = el.Initial
                            }
                            Dock.Current = Dock.Expanded = false
                        } else {
                            setTimeout(function () {
                                ME.offDock(id)
                            }, this.shrinkInterval)
                        }
                    }
                },
                setSizes: function (id, mxy) {
                    var Dock = this.docks[id], op = Dock.Opts, i = Dock.Elem.length, el, sz;
                    mxy = mxy || Dock.Delta;
                    while (i) {
                        el = Dock.Elem[--i];
                        sz = Math.floor(el.SizeDiff * Math.pow(Math.abs(mxy - el.Centre), op.coefficient) / op.attenuation);
                        el.Final = (sz < el.SizeDiff ? el[op.vh.wh] - sz : el.Initial)
                    }
                },
                factorSizes: function (id) {
                    var Dock = this.docks[id], op = Dock.Opts, lapse = op.duration + 60;
                    if (Dock.Timestamp) {
                        lapse = (new Date()).getTime() - Dock.Timestamp;
                        if (lapse >= op.duration) {
                            Dock.Timestamp = 0
                        }
                    }
                    if (lapse > 60) {
                        var f = lapse < op.duration ? lapse / op.duration : 0, i = 0, el;
                        while (i < Dock.Elem.length) {
                            el = Dock.Elem[i];
                            this.changeSize(id, i++, (f ? Math.floor(el.Initial + ((el.Final - el.Initial) * f)) : el.Final))
                        }
                    }
                },
                changeSize: function (id, idx, dim, force) {
                    var Dock = this.docks[id], el = Dock.Elem[idx];
                    if (force || el.Actual != dim) {
                        var op = Dock.Opts, bdr = ($.boxModel || op.orient.vh == 'v') ? 0 : Dock.Borders[op.vh.lead] + Dock.Borders[op.vh.trail];
                        if (el.Source[2] && !force && el.Actual == el.Initial) {
                            el.Img[0].src = el.Source[1]
                        }
                        if (Dock.OnDock) {
                            this.deltaXY(id)
                        }
                        Dock.Spread += dim - el.Actual;
                        var css = this.keepProportion(el, dim, op.orient), diff = op.size - css[op.vh.inv.wh], m = 'margin', z = op.vh.inv;
                        switch (op.align) {
                            case'bottom':
                            case'right':
                                css[m + z.lead] = diff;
                                break;
                            case'middle':
                            case'center':
                                css[m + z.lead] = (diff + diff % 2) / 2;
                                css[m + z.trail] = (diff - diff % 2) / 2;
                                break;
                            case'top':
                            case'left':
                                css[m + z.trail] = diff;
                                break;
                            default:
                        }
                        Dock.Yard[op.vh.wh](Dock.Spread + bdr);
                        el.Img.css(css);
                        Dock.Yard.css('margin' + op.vh.lead, Math.floor(Math.max(0, (Dock[op.vh.wh] - Dock.Spread) / 2)));
                        el.Actual = dim;
                        el.ActualInv = css[op.vh.inv.wh];
                        if (el.Source[2] && !force && el.Actual == el.Initial) {
                            el.Img[0].src = el.Source[0]
                        }
                    }
                }
            }
        }();
        $.fn.jqDock = function (opts) {
            return this.filter(function () {
                var i = jqDock.docks.length;
                while ((i--) && this != jqDock.docks[i].Menu) {
                }
                return (i < 0) && ($('img', this).length)
            }).hide().each(function () {
                var id = jqDock.docks.length;
                jqDock.docks[id] = {
                    Elem: [],
                    Menu: this,
                    OnDock: false,
                    Expanded: false,
                    Timestamp: 0,
                    width: 0,
                    height: 0,
                    Spread: 0,
                    Borders: {},
                    Yard: false,
                    Opts: $.extend({}, jqDock.defaults, opts || {}),
                    Current: false,
                    Delta: 0,
                    Loaded: 0,
                    Label: false
                };
                var Dock = jqDock.docks[id], op = Dock.Opts;
                op.attenuation = Math.pow(op.distance, op.coefficient);
                op.orient = ({left: 1, center: 1, right: 1}[op.align]) ? {vh: 'v', inv: 'h'} : {vh: 'h', inv: 'v'};
                op.vh = $.extend({}, jqDock.verthorz[op.orient.vh], {inv: jqDock.verthorz[op.orient.inv]});
                op.loader = (op.loader) && typeof op.loader == 'string' && /^image|jquery$/i.test(op.loader) ? op.loader.toLowerCase() : '';
                op.labels = op.labels === true ? {
                    top: 'bc',
                    left: 'tr',
                    right: 'tl'
                }[op.align] || 'tc' : (typeof op.labels == 'string' && {
                    tl: 1,
                    tc: 1,
                    tr: 1,
                    ml: 1,
                    mc: 1,
                    mr: 1,
                    bl: 1,
                    bc: 1,
                    br: 1
                }[op.labels] ? op.labels : false);
                $('img', this).each(function (n) {
                    var me = $(this), s0 = me.attr('src'), s1 = (op.source ? op.source.call(me[0], n) : false) || jqDock.altImage.call(this) || s0, tx = op.labels ? me.attr('title') || me.parent('a').attr('title') || '' : '';
                    Dock.Elem[n] = {
                        Img: me,
                        Source: [s0, s1, !(s0 == s1)],
                        Label: {txt: tx, width: 0, height: 0, widthPad: 0, heightPad: 0},
                        Initial: 0,
                        Actual: 0,
                        ActualInv: 0,
                        Final: 0,
                        Offset: 0,
                        Centre: 0,
                        Pad: {},
                        Linked: !!me.parent('a').length,
                        width: 0,
                        height: 0
                    };
                    $.each(['Top', 'Right', 'Bottom', 'Left'], function (i, v) {
                        Dock.Elem[n].Pad[v] = jqDock.asNumber(me.css('padding' + v))
                    })
                });
                var jqld = (!op.loader && jqDock.useJqLoader) || op.loader == 'jquery';
                $.each(Dock.Elem, function (i) {
                    var me = this, iLoaded = function () {
                        me.height = this.height;
                        me.width = this.width;
                        if (++Dock.Loaded >= Dock.Elem.length) {
                            setTimeout(function () {
                                jqDock.initDock(id)
                            }, 0)
                        }
                    };
                    if (jqld) {
                        $('<img />').bind('load', iLoaded).attr({src: this.Source[1]})
                    } else {
                        var pre = new Image();
                        pre.onload = function () {
                            iLoaded.call(this);
                            pre.onload = function () {
                            }
                        };
                        pre.src = this.Source[1]
                    }
                })
            }).end()
        };
        $.jqDock = function (x) {
            return jqDock[x] ? jqDock[x] : null
        }
    }
})(jQuery);

