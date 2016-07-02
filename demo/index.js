
angular
    .module('App', ['ngUIAlert'])
    .controller('AppCtrl', ['$scope', 'UIAlert', function($scope, UIAlert){
        $scope.showAlert1 = function(){
            UIAlert().show('my message "show alert 1"');
        };

        $scope.showAlert2 = function(){
            UIAlert().type('mytype').show('my message with css .mytype');
        };

        $scope.showAlert3 = function(){
            var a = UIAlert().type('alert-info').show('my message onShow, onHide (check log)', function(){
                console.log('show complete');

                setTimeout(function(){
                    a.hide(function(){
                        console.log('hide complete');
                    });
                }, 600);
            });
        };

        $scope.showAlert4 = function(){
            UIAlert().time(2000).type('alert-danger').show('my message. hide after 2 seconds');
        };
        $scope.showAlert5 = function(){
            UIAlert().time(2000).show('my message 1.', function(){
                UIAlert().time(2000).show('my message 2.', function(){
                    UIAlert().time(2000).show('my message 3.', function(){
                        UIAlert().time(2000).show('my message 4.');
                    });
                });
            });
        };
        $scope.showAlert6 = function(){
            var bts = ['OK', 'Cancel'];
            bts[-1] = 'ESC';
            UIAlert().buttons(bts).show('my message. with buttons', null, function(bt){
                if (bt || bt===-1){
                    UIAlert().type('alert-info').show('button <h1>' + (bts[bt]) + '</h1> clicked!');
                }
            });
        };
    }]);
