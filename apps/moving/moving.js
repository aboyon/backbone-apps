// Well... this is a backbone application
// this is not a todo application... if you want to learn how to make
// a  simple list over the localStore go to the backbone page and check the 
// examples


$(function(){
    
    var MovableObjectModel = Backbone.Model.extend({
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
    
    var MovableObjectView = Backbone.View.extend({
        
        initialize: function(shape) {
            this.shape = shape;
        },
        
        render: function() {
            var shapeHTML = '<div class="movableObj_active" ';
                shapeHTML+= ' style="position: absolute; ';
                shapeHTML+= ' left: ' + this.shape.get("x")+ 'px;';
                shapeHTML+= ' top: ' + this.shape.get("y")+ 'px;';
                shapeHTML+= ' width: ' + this.shape.get("width")+ 'px;';
                shapeHTML+= ' height: ' + this.shape.get("height")+ 'px;';
                shapeHTML+= '"></div>';
            console.log(shapeHTML);
            $('#app_context').append(shapeHTML);
        }
    });
    
    var MovingAreaView = Backbone.View.extend({
        
        events: {
            "mouseover" : "mouseover",
            "mousemove" : "mouseover",
            "mousedown" : "mousedown",
            "mouseout"  : "mouseout",
            "mouseup"   : "mouseup"
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
          this.resizing = true;
          return false;
        },
        
        mouseup: function(e) {
          this.resizing = false;
          var shape = new MovableObjectModel({
              x: this.originalX,
              y: this.originalY,
              width: Math.abs(e.pageX-this.originalX),
              height: Math.abs(e.pageY-this.originalY)
          });
          var ShapeView = new MovableObjectView(shape);
          ShapeView.render();
          return false;
        },
        
        mouseout:function(ev) {
            $(this.el).removeClass('focus_app_context');
        }
        
    });
    
    var MovingArea = new MovingAreaView({
        el: $('#app_context')
    });
   
});