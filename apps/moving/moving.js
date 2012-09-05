/**
 * @author David Silveira <jdsilveira@gmail.com>
 * @see http://davidsilveira.me/backbone-apps/
 * @example 
 * @desc just a backbone example to draw squares and move them into a moving/drawing area
 */

// // Well... this is a backbone application
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
           height: 200,
           active: false
       },
       
       setPosition: function(x,y) {
           this.set({x: x, y:y});
       },
       
       setSize: function(w,h) {
           this.set({width: w+'px', height: h+'px'});
       },
       
       setStatus: function(status) {
           this.set({ active:  status });
       }
       
    });
    
    var ShapeList = Backbone.Collection.extend({
        model: Shape,
        
        deactivateAll: function() {
            this.each(function(shape) {
              shape.set({ active: false });
            });
        }
    });

    var Shapes = new ShapeList();
    
    var Context = Backbone.View.extend({
        
        events: {
          'keydown': 'keydown'  
        },
        
        preventDefaultBehavior: function(status) {
            this.prevent_default = status;
        },
        
        keydown: function(e) {
            if (this.areaActive!=null) {
                e.preventDefault();
                var activeShape = this.areaActive.collection.filter(function(shape){
                    return shape.get('active') === true;
                });

                console.log(this.areaActive.collection.size());

                if (activeShape) {
                    var shape = activeShape[0];
                    var currentX = shape.get('x');
                    var currentY = shape.get('y');
                    console.log('X:' + currentX);
                    console.log('Y:' + currentY);
                    switch(e.keyCode) {
                        case 37: 
                            shape.setPosition(currentX - 10, currentY);
                            break;
                        case 38: 
                            shape.setPosition(currentX, currentY - 10);
                            break;
                        case 39: 
                            shape.setPosition(currentX + 10, currentY);
                            break;
                        case 40: 
                            shape.setPosition(currentX, currentY + 10);
                            break;
                    }
                }
            }
        }
        
    });
    
    
    var MovableObjectView = Backbone.View.extend({
        
        limitPadding: 10,
        
        initialize: function() {
            $(this.options.ns).mousemove(this, this.mousemove).mouseup(this, this.mouseup);
            this.min_limit_x = $(this.options.ns).position().left;
            this.min_limit_y = $(this.options.ns).position().top;
            this.max_limit_x = parseInt($(this.options.ns).outerWidth() + this.min_limit_x - this.model.get('width') - 20);
            this.max_limit_y = parseInt($(this.options.ns).outerHeight() + this.min_limit_y - this.model.get('height') - 20);
            this.model.bind('change', this.updateView, this);
        },
        
        events: {
            'mousedown .movableObj_active' : 'draggingStart',
            'click .movableObj_active' : 'click'
        },
        
        click: function(e) {
            world.preventDefaultBehavior(true);
            Shapes.deactivateAll();
            this.model.setStatus(true);
            this.updateView();
        },
        
        updateView: function() {
            if (this.checkposition()) {
                $(this.el).css({
                    left:       this.model.get('x'),
                    top:        this.model.get('y'),
                    width:      this.model.get('width'),
                    height:     this.model.get('height') 
                });
            }
            if (this.model.get('active') == true) {
                $(this.el).addClass('shape_selected');
            } else {
                $(this.el).removeClass('shape_selected');
            }
        },
        
        render: function() {
            $('.shape_selected').removeClass('shape_selected');
            $(this.options.ns).append(this.el);
            $(this.el)
                .addClass('shape')
                .attr({ tabindex: 0 })
                .html('<div class="movableObj_active""/>')
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
                if (self.checkposition(e.pageX - self.initialX,e.pageY - self.initialY)) {
                    self.model.setPosition(e.pageX - self.initialX, e.pageY - self.initialY);
                }                
            }
        },
        
        checkposition: function(x,y) {
            if (x < this.min_limit_x) return false;
            if (x > this.max_limit_x) return false;
            if (y < this.min_limit_y) return false;
            if (y > this.max_limit_y) return false;
            return true;
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
            "mouseup"   : "mouseup",
            "click"     : "click"
        },
        
        adding: function(m) {
            this.views[m.cid] = new MovableObjectView({
                model: m,
                id:'view_' + m.cid,
                ns: this.el
            }).render();
            $('#mouse_cords').append(' ' +this.collection.length + ' elements created');
        },
        
        mouseover:function(e) {
            this.options.active = true;
            world.areaActive = this;
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
            this.options.active = false;
            world.areaActive = null;
            Shapes.deactivateAll();
            $(this.el).removeClass('focus_app_context');
        }
        
    });
    
    var world = new Context({
       el: $(document)
    });
    
    var MovingArea = new MovingAreaView({
        id: 'app_context',
        el: $('#app_context'),
        collection: Shapes,
        world: world,
        active: true
    });
   
});