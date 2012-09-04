// Well... this is a backbone application
// this is not a todo application... if you want to learn how to make
// a  simple list over the localStore go to the backbone page and check the 
// examples

var MOVING = false;

$(function(){
    
    var Shape = Backbone.Model.extend({
       defaults: {
           x: 0,
           y: 0,
           width: 200,
           height: 200
       },
       
       setPosition: function(x,y) {
           this.set({x: x, y:y});
       },
       
       setSize: function(w,h) {
           this.set({width: w+'px', height: h+'px'});
       }
       
    });
    
    var ShapeList = Backbone.Collection.extend({
        model: Shape
    });

    var Shapes = new ShapeList();
    
    var MovableObjectView = Backbone.View.extend({
        
        initialize: function() {
            $('#app_context').mousemove(this, this.mousemove).mouseup(this, this.mouseup);
            this.model.bind('change', this.updateView, this);
        },
        
        events: {
            'mousedown .movableObj_active' : 'draggingStart'
        },
        
        updateView: function() {
            $(this.el).css({
                left:       this.model.get('x'),
                top:        this.model.get('y'),
                width:      this.model.get('width'),
                height:     this.model.get('height') 
            });
        },
        
        render: function() {
            $('#app_context').append(this.el);
            $(this.el).html('<div class="movableObj_active""/>')
                .css({
                    position: 'absolute', 
                    padding: '10px',
                    height: this.model.get("height")+'px',
                    width: this.model.get("width")+'px'
                });
            this.updateView();
            return this;
        },
        
        draggingStart: function (e) {
            this.dragging = MOVING = true;
            $(this.el).css({
                opacity: 0.2
            });
            this.initialX = e.pageX - this.model.get('x');
            this.initialY = e.pageY - this.model.get('y');
        },
        
        mouseup: function (e) {
            if (!e.data) return;
            var self = e.data;
            self.dragging = MOVING = false;
            $(self.el).css({
                opacity: 1.0
            });
        },
        
        mousemove: function(e) {
            if (!e.data) return;
            var self = e.data;
            if (self.dragging) {
                self.model.setPosition(e.pageX - self.initialX, e.pageY - self.initialY);
            }
        }
        
    });
    
    
    
    var MovingAreaView = Backbone.View.extend({
        
        initialize: function() {
          this.collection.bind('add', this.adding, this);
        },
        
        views: {},
        
        events: {
            "mousemove" : "mouseover",
            "mousedown" : "mousedown",
            "mouseout"  : "mouseout",
            "mouseup"   : "mouseup"
        },
        
        adding: function(m) {
            this.views[m.cid] = new MovableObjectView({
                model: m,
                id:'view_' + m.cid
            }).render();
            $('#mouse_cords').append(' ' +this.collection.length + ' elements created');
        },
        
        mouseover:function(e) {
            $(this.el).addClass('focus_app_context');
            $('#mouse_cords').html('X: (' + e.pageX + '), Y: ('+e.pageY+')');
        },
        
        mousedown: function(e) {
          this.originalX = e.pageX;
          this.originalY = e.pageY;
          return false;
        },
        
        mouseup: function(e) {
          if (MOVING == false) {
                var config = {
                    x: (e.pageX-this.originalX<0) ? e.pageX : this.originalX,
                    y: (e.pageY-this.originalY<0) ? e.pageY : this.originalY,
                    width: Math.abs(e.pageX-this.originalX),
                    height: Math.abs(e.pageY-this.originalY)
                };
                if (config.width > 0 && config.height > 0) {
                    this.collection.add(new Shape(config));
                }
          }
        },
        
        mouseout:function(ev) {
            $(this.el).removeClass('focus_app_context');
        }
        
    });
    
    var MovingArea = new MovingAreaView({
        id: 'app_context',
        el: $('#app_context'),
        collection: Shapes
    });
   
});