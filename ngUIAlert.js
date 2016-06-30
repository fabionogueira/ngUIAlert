/**
 * ngUIAlert.js
 * 
 * @version 1.0.0
 * @service UIAlert
 * @dependecies FtDOM
 * @description 
 *      Permite exibir mensagens elegantes na tela.
 *      Usa as classes css ft-alert e ft-alert-content contidas no arquivo ngFtAlert.css
 * @example 
 *      //Show message 'My Message', call onShow after complete, call onHide after hide complete
 *      FtAlert().show('My Message', function onShow(){}, function onHide(){});
 *      
 *      //Show 'My Warn Message'. 'warn' theme is defined in css class .warn
 *      FtAlert().type('warn').show('My Warn Message!');
 *      
 *      //Show 'My Message' and hide after 1000 miliseconds
 *      FtAlert().time(1000).show('My Message!');
 *      
 *      //Show 'My Message!' and hide after show
 *      var a = FtAlert();
 *      a.show('My Message!', function(){
 *          a.hide(function onHide(){});
 *      });
 *      
 */
(function(){
    var alertInstances = {}, UIAlertService, $animate, $timeout, NG_HIDE_CLASS;
    
    NG_HIDE_CLASS = 'ui-alert-hide';
    
    angular.module('ngUIAlert', ['ngAnimate'])
        .run(['$animate', '$timeout', function(animate, timeout){
            $animate = animate;
            $timeout = timeout;
        }])
        .service('UIAlert', function(){
            return UIAlertService();
        });

    angular.element(document).on('keydown', function(event){
        var i, a, keyCode = event.which || event.keyCode;

        if (keyCode===27){
            for (i in alertInstances){
                a = alertInstances[i];
                if (a._visible){
                    a.hide();
                }
            }
        }
    });
    
    UIAlertService = function(){
        var index = 0;
        
        return function(){
            return getInstance();
        };
        
        function getInstance(){
            var i, a, order=0;
            
            for (i in alertInstances){
                if (!alertInstances[i]._visible){
                    a = alertInstances[i];
                    
                    a._visible= false;
                    a._type   = '';
                    a._time   = 0;
                    a._fnHide = null;
                    a._buttons= [];
                    
                    break;
                }
                order++;
            }
            
            if (!a){
                a = alertInstances[index] = createInstance();
            }
            
            a._order = order;
            
            return a;
        }
        function createInstance(){
            index ++;
            return {
                _visible: false,
                _type: '',
                _id: 'alert-id-'+index, 
                _time: 0,
                _order: 0,
                _fnHide: null,
                
                template: '<div class="ui-alert ui-alert-hide">'+
                            '<div class="ui-alert-content">'+
//                                '<div class="layout-alert-text"></div>'+
//                                '<div class="layout-alert-buttons"></div>'+
                            '</div>'+
                          '</div>',
                  
                type: function(type){
                    this._type = type;
                    return this;
                },
                buttons: function(buttons){
                    this._buttons = angular.isArray(buttons) ? buttons : [buttons];
                    return this;
                },
                time: function(time){
                    this._time = time;
                    return this;
                },
                show: function(msg, onComplete, fnHide){
                    var self, content, $element = angular.element(document.getElementById(this._id));
                    
                    if ($element.length===0){
                        $element = angular.element(this.template);
                        $element.attr('id', this._id).on('mousedown', alertOnMouseDown);
                    }
                    
                    content = $element[0].childNodes[0]; //'.ft-alert-content';
                    
                    if (content){
                        angular.element(content)
                            .removeClass(this._type)
                            .attr('ui-alert-order', this._order)
                            .addClass(this._type || '')
                            .html(msg);
                 
                        angular.element(document.body)
                            .append($element);
                        
                        this._fnHide  = fnHide;
                        this._visible = true;
                        
                        $timeout(function(){
                            $animate.removeClass($element, NG_HIDE_CLASS).then(function(){
                                if (onComplete) onComplete();
                            });
                        });
                        
                        if (this._time>0){
                            self = this;
                            this._timeout = setTimeout(function(){self.hide();}, this._time);
                        }
                    }
                    
                    return this;
                },
                hide: function(fn){
                    var self, $element = angular.element(document.getElementById(this._id));
                    
                    self = this;
                    clearTimeout(this._timeout);
                    
                    if ($element.length>0){
                        $timeout(function(){
                            $animate.addClass($element, NG_HIDE_CLASS).then(complete);
                        });
                    }else{
                        complete();
                    }  
                    
                    function complete(){
                        var content = $element[0].childNodes[0]; //'.ft-alert-content';
                                
                        if (content){
                            angular.element(content)
                                .removeAttr('ft-order')
                                .removeClass(self._type);
                            
                            $element.remove();
                        }
                        
                        if (self._fnHide) self._fnHide();
                        if (fn) fn();
                        
                        self._type    = '';
                        self._visible = false;
                        self._fnHide  = null;
                    }
                    
                    return this;
                }
            };
        }
        function getAlertById(id){
            var i;
            
            for (i in alertInstances){
                if (alertInstances[i]._id === id){
                    return alertInstances[i];
                }
            }
            
            return null;
        }
        function alertOnMouseDown(){
            var e = angular.element(this),
                instance = getAlertById(e.attr('id'));
            
            if (instance){
                instance.hide();
            }
        }
    };
    
}());
