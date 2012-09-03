// Well... this is a backbone application
// this is not a todo application... if you want to learn how to make
// a  simple list over the localStore go to the backbone page and check the 
// examples


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
        
        events: {
            'mousedown .movableObj_active': 'draggingStart',
            'mouseover .movableObj_active': 'mousemove'
        },
        
        initialize: function() {
            $('#app_context').mousemove(this, this.mousemove).mouseup(this, this.mouseup);
            this.model.bind('change', this.updateView, this);
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
            var shapeHTML = '<div id="'+this.model.get('cid')+'" class="movableObj_active" ';
                    shapeHTML+= ' style="position: absolute; ';
                    shapeHTML+= ' left: ' + this.model.get("x")+ 'px;';
                    shapeHTML+= ' top: ' + this.model.get("y")+ 'px;';
                    shapeHTML+= ' width: ' + this.model.get("width")+ 'px;';
                    shapeHTML+= ' height: ' + this.model.get("height")+ 'px;';
                    shapeHTML+= '"></div>';
            $('#app_context').append(shapeHTML);
            return this;
        },
        
        mousemove: function(e) {
          alert('paso');
        },
        
        draggingStart: function (e) {
            alert('y si');
            this.dragging = true;
            this.initialX = e.pageX - this.model.get('x');
            this.initialY = e.pageY - this.model.get('y');
        },
        
        mouseup: function (e) {
            if (!e.data) return;
            var self = e.data;
            self.dragging = false;
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
            $('#mouse_cords').append(' ' +Shapes.length + ' elements created')
        },
        
        mouseover:function(e) {
            $(this.el).addClass('focus_app_context');
            if (this.dragging) {
                $('#mouse_cords').html('Creating object from X: (' + e.pageX + '), Y: ('+e.pageY+')');
            } else {
                $('#mouse_cords').html('X: (' + e.pageX + '), Y: ('+e.pageY+')');
            }
        },
        
        mousedown: function(e) {
          this.originalX = e.pageX;
          this.originalY = e.pageY;
          return false;
        },
        
        mouseup: function(e) {
          var config = {
                x: (e.pageX-this.originalX<0) ? e.pageX : this.originalX,
              	y: (e.pageY-this.originalY<0) ? e.pageY : this.originalY,
                width: Math.abs(e.pageX-this.originalX),
                height: Math.abs(e.pageY-this.originalY)
            };
            if (config.width > 0 && config.height > 0) {
                this.adding(new Shape(config));
            }
          return false;
        },
        
        mouseout:function(ev) {
            $(this.el).removeClass('focus_app_context');
        }
        
    });
    
    var MovingArea = new MovingAreaView({
        el: $('#app_context'),
        collection: ShapeList
    });
   
});