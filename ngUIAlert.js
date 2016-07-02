/**
 * ngUIAlert.js
 * 
 * @version 1.0.1
 * @service UIAlert
 * @author Fábio Nogueira <fabio.bacabal@gmail.com>
 * @dependecies ngAnimate
 * @description 
 *      Permite exibir mensagens elegantes na tela.
 *      Usa as classes css ui-alert e ui-alert-content contidas no arquivo ngUIAlert.css
 * @example 
 *      //Show message 'My Message', call onShow after complete, call onHide after hide complete
 *      UIAlert().show('My Message', function onShow(){}, function onHide(){});
 *      
 *      //Show 'My Warn Message'. 'warn' theme is defined in css class .warn
 *      UIAlert().type('warn').show('My Warn Message!');
 *      
 *      //Show 'My Message' and hide after 1000 miliseconds
 *      UIAlert().time(1000).show('My Message!');
 *      
 *      //Show 'My Message!' and hide after show
 *      var a = UIAlert();
 *      a.show('My Message!', function(){
 *          a.hide(function onHide(){});
 *      });
 *      
 */

(function(){
    var alertInstances = {}, UIAlertService,
        UI_ALERT_HIDE_CLASS  = window.UI_ALERT_HIDE_CLASS   || 'ui-alert-hide',
        UI_ALERT_CLASS       = window.UI_ALERT_CLASS        || '',
        UI_ALERT_TYPE_CLASS  = window.UI_ALERT_TYPE_CLASS   || '',
        UI_ALERT_BUTTON_CLASS= window.UI_ALERT_BUTTON_CLASS || '';
    
    angular.module('ngUIAlert', ['ngAnimate'])
        .service('UIAlert', ['$animate', '$timeout', function($animate, $timeout){
            return UIAlertService($animate, $timeout);
        }]);

    angular.element(document).on('keydown', function(event){
        var i, a, instance, keyCode = event.which || event.keyCode;

        if (keyCode===27){
            a = [];
            
            for (i in alertInstances){
                if (alertInstances[i]._visible){
                    a.push(alertInstances[i]);
                }
            }
            
            for (i=0; i<a.length; i++){
                instance = a[i];
                instance._buttonTarget = -1;
                instance.hide();
            }
        }
    });
    
    UIAlertService = function($animate, $timeout){
        var index = 0;
        
        return function(){
            return getInstance();
        };
        
        function getInstance(){
            var i, a;
            
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
            }
            
            if (!a){
                a = alertInstances[index] = createInstance();
            }
            
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
                _onHide: null,
                
                template: '<div class="ui-alert ui-alert-hide">'+
                            '<div class="ui-alert-content">'+
                                '<div class="ui-alert-text"></div>'+
                                '<div class="ui-alert-buttons"></div>'+
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
                show: function(msg, onComplete, onHide){
                    var i, s, self, elContent, elButtons, elText, $element = angular.element(document.getElementById(this._id));
                    
                    if ($element.length===0){
                        $element = angular.element(this.template);
                        $element.attr('id', this._id).on('click', alertOnClick);
                    }
                    
                    elContent = $element[0].childNodes[0]; //.ui-alert-content
                    elText    = elContent.firstChild;      //.ui-alert-text
                    elButtons = elText.nextSibling;        //.ui-alert-buttons
                    
                    if (this._buttons){
                        s = '';
                        for (i=0; i<this._buttons.length; i++){
                            s += ('<button class="'+(UI_ALERT_BUTTON_CLASS)+'" data-ui-alert-button="'+(i)+'">'+(this._buttons[i])+'</button>');
                        }
                        elButtons.innerHTML = s;
                    }
                    
                    delete(this._buttons);
                    
                    angular.element(elContent)
                        .attr('class', 'ui-alert-content ' + (UI_ALERT_CLASS + ' ' + (this._type || UI_ALERT_TYPE_CLASS)));
                        
                    angular.element(elText)
                        .html(msg);

                    angular.element(document.body)
                        .append($element);

                    this._onHide  = onHide;
                    this._visible = true;

                    $timeout(function(){
                        $animate.removeClass($element, UI_ALERT_HIDE_CLASS).then(function(){
                            if (onComplete) onComplete();
                        });
                    });

                    if (this._time>0){
                        self = this;
                        this._timeout = setTimeout(function(){self.hide();}, this._time);
                    }

                    return this;
                },
                hide: function(fn){
                    var self, bt,
                        $element = angular.element(document.getElementById(this._id));
                    
                    self = this;
                    bt   = self._buttonTarget;
                    
                    clearTimeout(self._timeout);
                    delete(self._buttonTarget);
                    
                    if (bt && self._onHide){
                        self._onHide(bt);
                        self._onHide = null;
                    }
                    
                    if ($element.length>0){
                        $timeout(function(){
                            $animate.addClass($element, UI_ALERT_HIDE_CLASS).then(complete);
                        });
                    }else{
                        complete();
                    }  
                    
                    function complete(){
                        var content = $element[0].childNodes[0]; //'.ui-alert-content';
                                
                        if (content){
                            angular.element(content)
                                .removeAttr('ui-alert-order')
                                .removeClass(self._type);
                            
                            $element.remove();
                        }
                        
                        if (self._onHide) self._onHide(bt);
                        if (fn) fn();
                        
                        self._type    = '';
                        self._visible = false;
                        self._onHide  = null;
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
        function alertOnClick(event){
            var bt,
                e = angular.element(this),
                instance = getAlertById(e.attr('id'));
            
            if (instance){
                if (getParent(event.target, function(el){return el.className.indexOf('ui-alert-content')>=0;})){
                    //mouse sobre o alert, verifica se foi sobre um botão
                    bt = getParent(event.target, function(el){return el.getAttribute('data-ui-alert-button');});
                    if (bt){
                        //mouse sobre um botão
                        instance._buttonTarget = bt.getAttribute('data-ui-alert-button');
                        instance.hide();
                    }
                    return false;
                }
                
                instance.hide();
            }
        }
        function getParent(target, fn){
            while (target && target!==document.body){
                if (fn(target)){
                    return target;
                }
                target = target.parentNode;
            }
            return null;
        }
    };
    
}());
