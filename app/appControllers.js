function signInController($log, $rootScope, $scope, wydNotifyService, storageService, sessionService, $location, $timeout) {
    var cmpId = 'signInController', cmpName = 'Sign In';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function reset() {
        $log.info('reset started...');

        vm.form.$setPristine();
        vm.message = 'Sign In';

        $log.info('reset started...');
    }

    function signIn() {
        $log.info('signIn started...');

        vm.message = 'Sign In';
        var params = {userId: vm.userId, password: vm.password};
        sessionService.signIn(params).then(function (res) {
            sessionService.getCurrentSession().then(function (res) {
                //console.log(res);
                $log.info('Current Session Id : ' + $rootScope.sessionId);
                $log.info('Current User Id    : ' + res.username);
                $log.info('Current User Role  : ' + res.role);

                $rootScope.session = res;
                //$rootScope.homePath = '/sign-up';
                $location.path('/users');
            });
        }, function (res) {
            console.log(res);
            wydNotifyService.showError(res.message);
        });

        $log.info('signIn finished...');
    }

    function init() {
        $log.info('init started...');

        vm.message = 'Sign In';

        if(window.location.hostname == 'localhost') {
            vm.userId = 'sa@maxmoney.com';
            vm.password = 'MaxMoney@2016';
            //$timeout(signIn, 2000);
        }

        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        signIn: signIn,
        reset: reset
    });

    init();

    $log.info(cmpId + 'finished...');
}
signInController.$inject = ['$log', '$rootScope', '$scope', 'wydNotifyService', 'storageService', 'sessionService', '$location', '$timeout'];
appControllers.controller('signInController', signInController);

function signOutController($log, $rootScope, $scope, sessionService, $location) {
    var cmpId = 'signOutController', cmpName = 'Sign Out';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function onSignOut() {
        sessionService.currentCustomer = null;
        $rootScope.session = null;
        $rootScope.sessionId = null;
        $rootScope.homePath = '/sign-in';
    }

    sessionService.signOut().then(function (res) {
        onSignOut();
        $location.path('/sign-in');
    }, function (res) {
        onSignOut();
        $location.path('/sign-in');
    });

}
signOutController.$inject = ['$log', '$rootScope', '$scope', 'sessionService', '$location'];
appControllers.controller('signOutController', signOutController);

/*
function signUpController($log, $rootScope, $scope, _session, wydNotifyService, storageService, sessionService, $uibModal, $location) {
    var cmpId = 'signUpController', cmpName = 'Customer Registration';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    var dnationality = {name: '-', dial_code: '-', code: '-', nationality: '<Select Nationality>'};

    vm.countries = sessionService.countries;
    vm.malasiyaStates = sessionService.malasiyaStates;
    vm.sourceOfIncomes = sessionService.sourceOfIncomes;
    vm.natureOfBusinesses = sessionService.natureOfBusinesses;

    $scope.$on('session:countries', function (event, data) {
        vm.countries = sessionService.countries;
        // if (vm.countries && vm.countries.length > 0) {
        //     vm.countries.unshift(dnationality);
        // }
    });

    $scope.$on('session:malasiyaStates', function (event, data) {
        vm.malasiyaStates = sessionService.malasiyaStates;
        // if (vm.malasiyaStates && vm.malasiyaStates.length > 0) {
        //     vm.malasiyaStates.unshift(vm.state);
        // }
    });

    $scope.$on('session:sourceOfIncomes', function (event, data) {
        vm.sourceOfIncomes = sessionService.sourceOfIncomes;
    });

    $scope.$on('session:natureOfBusinesses', function (event, data) {
        vm.natureOfBusinesses = sessionService.natureOfBusinesses;
    });

    function addOrEditBeneficiary() {
        var bnyModel = vm.beneficiary.id == 'NA' ? null : vm.beneficiary;
        var modalInstance = $uibModal.open({
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'app/views/beneficiaryAddOrEdit.html',
            controller: 'beneficiaryAddOrEditController',
            controllerAs: 'vm',
            size: 'lg',
            resolve: {
                model: function () {
                    //sessionService.switchOffAutoComplete();
                    return bnyModel;
                },
                country: function () {
                    return null;
                }
            }
        });
        modalInstance.result.then(function (result) {
            $log.info('beneficiary created successfully...');
            vm.beneficiary = result;
            vm.beneficiaryLabel = 'Edit';
            //loadBeneficiaries();
        }, function () {
            $log.info('canceled beneficiary creation...');
        });
    }

    function validateDob() {
        $log.info('vm.dob = ' + vm.dob);
        var dob = moment(vm.dob, 'DDMMYYYY');
        vm.form.dob.$setValidity('min', !dob.isAfter(vm.dobxMax));
        $log.info('min = ' + dob.format('DD-MM-YYYY') + ' > ' + vm.dobxMax.format('DD-MM-YYYY') + ' = ' + dob.isAfter(vm.dobxMax));
        vm.form.dob.$setValidity('max', !dob.isBefore(vm.dobxMin));
        $log.info('max = ' + dob.format('DD-MM-YYYY') + ' < ' + vm.dobxMin.format('DD-MM-YYYY') + ' = ' + dob.isBefore(vm.dobxMin));
    }

    function onDobChange() {
        if (vm.dob) {
            vm.dobx = moment(vm.dob, 'DDMMYYYY');
            validateDob();
        }
    }

    function onDobChangeX(nv, ov) {
        //console.log(ov);
        //console.log(nv);
        if (nv) {
            vm.dob = nv.format('DDMMYYYY');
            validateDob();
        }
    }

    function onNationalityChange() {
        vm.dialCode = vm.nationality.dial_code;
    }

    function onNationalityChangeX(ov, nv) {
        if (nv) {
            vm.dialCode = nv.dial_code;
            vm.form.nationality.$setValidity('required', false);
             $log.info('ov value is : ', nv);
            if (nv.code == 'MY') {
                    vm.idType = 'nric';
                } else {
                    vm.idType = 'passport';
                }
        } else {
            vm.dialCode = '-';
            vm.form.nationality.$setValidity('required', true);
        }
        //
        //$log.info(vm.nationality);
        //if (vm.nationality.code == 'MY') {
        //    vm.idType = 'nric';
        //} else {
        //    vm.idType = 'passport';
        //}


    }

    function onStateChangeX(ov, nv) {
        if (nv) {
            vm.form.state.$setValidity('required', false);
        } else {
            vm.form.state.$setValidity('required', true);
        }
    }

    function onIdTypeChange() {
        if (vm.idType == 'nric') {
            vm.nationality = _.find(vm.countries, function (item) {
                return item.code == 'MY';
            });
            if (vm.nationality) {
                onNationalityChange();
            }
        }
    }

    function reset() {
        $log.info('reset started...');

        vm.form.$setPristine();
        vm.beneficiary = {id: 'NA'};
        vm.beneficiaryLabel = 'Add';
        vm.dialCode = '-';
        vm.nationality = null;
        vm.state = null;

        $log.info('reset finished...');
    }

    function save() {
        $log.info('saving started...');

        wydNotifyService.hide();

        if (vm.form.$pristine) {
            wydNotifyService.showError('There is no change. Hence, nothing to save.');
            return;
        }
        if (vm.password != vm.confirmPassword) {
            wydNotifyService.showError('Password and Confirm password not matched');
            return;
        }

        var reqCus = {};

        var value = vm.name;
        reqCus.customerName = value;

        value = vm.emailId;
        reqCus.email = value;

        value = vm.mobileNo;
        value = value.replace(new RegExp('_', 'g'), ' ').trim();
        reqCus.mobile = '+60' + value;

        if (vm.idType == 'nric') {
            value = vm.idNoNric;
            reqCus.idNo = value;
        } else {
            value = vm.idNoPassport;
            reqCus.idNo = value;
            reqCus.idExpiryDate = moment().add(365, 'days').format('DD-M-YYYY');
        }

        value = vm.nationality;
        reqCus.nationality = value.nationality;

        value = vm.idType;
        if (value == 'nric') {
            reqCus.idType = value.toUpperCase();
        } else {
            reqCus.idType = 'Passport';
        }

        value = vm.dob;
        reqCus.dob = moment(value, 'DDMMYYYY').format('DD-MM-YYYY');
        //reqCus.dob = value;

        if (vm.accountType != 'personal') {
            value = vm.companyType;
            reqCus.companyType = value;
        }

        value = vm.state;
        reqCus.state = value.toUpperCase().replace(' ', '_');

        value = vm.city;
        reqCus.city = value;

        value = vm.address;
        reqCus.address = value;

        value = vm.postalCode;
        reqCus.postalCode = value;

        if (vm.accountType != 'personal') {
            value = vm.companyName;
            reqCus.companyName = value;
        }

        if (vm.accountType != 'personal') {
            value = vm.companyType;
            reqCus.companyType = value;
        }

        if (vm.accountType != 'personal') {
            value = vm.contactPerson;
            reqCus.contactPerson = value;
        }

        if (vm.accountType != 'personal') {
            value = vm.nameOfBusiness;
            reqCus.natureOfBusiness = value;
        }

        value = vm.accountType;
        if (value == 'personal') {
            reqCus.type = 'Individual';
        } else {
            reqCus.type = 'SME';
        }

        reqCus.country = 'Malaysia';

        if (vm.beneficiary.id != 'NA') {
            reqCus.beneficiaryId = vm.beneficiary.id;
        }
        $log.info(reqCus);
        // sessionService.signUp(reqCus).then(function (res) {
        //     $log.debug(res);
        //     sessionService.currentCustomer = res.data;
        //     res.data.password = vm.confirmPassword;
        //     res.data.sourceOfIncomeX = vm.sourceOfIncome;
        //     res.data.natureOfBusinessX = vm.natureOfBusiness;
        //     storageService.saveCustomer(res.data);
        //     wydNotifyService.showSuccess('Successfully signed up...');
        //     $location.path('/cdd');
        // }, function (res) {
        //     $log.error(res);
        //     wydNotifyService.showError(res.data.description);
        // });

        $log.info('saving finished...');
    }

    function preFill() {

        vm.emailId = 'sample@gmail.com';
        vm.password = '12345';
        vm.confirmPassword = '12345';
        vm.name = 'Sample';

        vm.nationality = vm.countries[1];

        vm.mobileNo = '1234567890';
        vm.accountType = 'personal';
        vm.idType = 'passport';
        vm.idNoPassport = '123400';

        vm.dob = '10-05-1980';
        vm.form.dob.$setValidity('date', true);

        vm.address = 'abc address';
        vm.city = 'Chennai';

        vm.state = vm.malasiyaStates[0];

        vm.postalCode = '12345';
        vm.sourceOfIncome = 'Individual';
        vm.natureOfBusiness = 'Accountants';

        angular.forEach(vm.form.$error, function(type) {
            angular.forEach(type, function(field) {
                field.$setDirty();
            });
        });

        console.log(vm.nationality);
    }

    function init() {
        $log.info('init started...');

        vm.beneficiaryLabel = 'Add';
        vm.beneficiary = {id: 'NA'};
        vm.dialCode = '-';
        vm.accountType = 'personal';
        vm.idType = 'passport';
        //onIdTypeChange();

        var tmoment = moment().subtract(18, 'years');
        vm.dobMax = tmoment.format('YYYY-MM-DD');
        vm.dobxMax = tmoment;
        tmoment = moment().subtract(100, 'years');
        vm.dobMin = tmoment.format('YYYY-MM-DD');
        vm.dobxMin = tmoment;

        //vm.nationality = dnationality;
        // if (vm.countries && vm.countries.length > 0) {
        //     vm.countries.unshift(dnationality);
        // }

        // vm.state = '<Select State>';
        // if (vm.malasiyaStates && vm.malasiyaStates.length > 0) {
        //     vm.malasiyaStates.unshift(vm.state);
        // }
        if(_.keys(vm.sourceOfIncomes).length === 0) {
            sessionService.getSourceOfIncomes();
        }
        if(_.keys(vm.natureOfBusinesses).length === 0) {
            sessionService.getNatureOfBusinesses();
        }

        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        addOrEditBeneficiary: addOrEditBeneficiary,
        onDobChange: onDobChange,
        onDobChangeX: onDobChangeX,
        onNationalityChange: onNationalityChange,
        onNationalityChangeX: onNationalityChangeX,
        onStateChangeX: onStateChangeX,
        onIdTypeChange: onIdTypeChange,
        save: save,
        reset: reset,
        preFill: preFill
    });

    init();

    $log.info(cmpId + 'finished...');
}
signUpController.$inject = ['$log', '$rootScope', '$scope', '_session', 'wydNotifyService', 'storageService', 'sessionService', '$uibModal', '$location'];
signUpController.resolve = {
    '_session': ['sessionService', function (sessionService) {
        //sessionService.switchOffAutoComplete();
        return '-:coming_soon:-';
        //return sessionService.getCurrentSession();
    }]
};
appControllers.controller('signUpController', signUpController);

function cddController($log, $rootScope, $scope, _session, wydNotifyService, storageService, sessionService, $http, Upload, $location) {
    var cmpId = 'cddController', cmpName = 'CDD';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function onCustomerChange() {
        sessionService.getCustomer(vm.customer.idNo).then(function (res) {
            _.assign(vm.customer, res);
            $log.info(vm.customer);
        });
    }

    function save() {
        $log.info('update started...');

        wydNotifyService.hide();

        var path = sessionService.getApiBasePath() + '/customers/' + vm.customer.idNo;
        var reqData = {'idType': vm.customer.idType};
        if (vm.customer.idType == 'Passport') {
            if (!vm.passportFront && !vm.passportBack) {
                wydNotifyService.showWarning('There is nothing to update...');
                return;
            }
            if (vm.passportFront) {
                reqData['front'] = vm.passportFront;
            }
            if (vm.passportBack) {
                reqData['back'] = vm.passportBack;
            }
        }
        if (vm.customer.idType == 'NRIC') {
            if (!vm.nricFront && !vm.nricBack) {
                wydNotifyService.showWarning('There is nothing to update...');
                return;
            }
            if (vm.nricFront) {
                reqData['front'] = vm.nricFront;
            }
            if (vm.nricBack) {
                reqData['back'] = vm.nricBack;
            }
        }
        //if (vm.signature) {
        //    reqData['signature'] = vm.signature;
        //}

        $log.info(reqData);
        Upload.upload({
            url: path,
            method: 'PUT',
            headers: {'api-key': $rootScope.sessionId},
            transformRequest: angular.identity,
            data: reqData
        }).then(function (res) {
            $log.debug(res);
            wydNotifyService.showSuccess('Successfully updated...');
            approve();
        }, function (res) {
            $log.debug(res);
            $log.error('Error Status: ' + res.status);
            wydNotifyService.showError('Update failed. ' + res.description);
        }, function (evt) {
            $log.info(evt);
            var pp = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            if (vm.customer.idType == 'Passport') {
                vm.passportFront.progress = pp;
                vm.passportBack.progress = pp;
            }
            if (vm.customer.idType == 'NRIC') {
                vm.nricFront.progress = pp;
                vm.nricBack.progress = pp;
            }
            //vm.signature.progress = pp;
            //$log.info('Progress: ' + pp + '% ');
        });

        // var reqData = { 'customerName' : vm.name};
        // var req = {
        //     method: 'PUT',
        //     url: path,
        //     headers: { 'api-key' : $rootScope.sessionId},
        //     params: reqData
        // };

        //console.log(vm.passportFrontX);
        // var reqData = new FormData();
        // reqData.append('front', vm.passportFrontX);
        // reqData.append('customerName', vm.name);
        // var req = {
        //     method: 'PUT',
        //     url: path,
        //     headers: { 'api-key' : $rootScope.sessionId, 'Content-Type': undefined},
        //     transformRequest: angular.identity,
        //     data: reqData
        // };

        // $log.info(req);
        // $http(req).then(function (res) {
        //     console.log(res);
        // }, function (res) {
        //     console.log(res);
        // });

        $log.info('update finished...');
    }

    function approve() {
        $log.info('approve started...');
        $log.info(vm.customer.idNo);

        sessionService.approve(vm.customer.idNo).then(function (res) {
            $log.debug(res);
            wydNotifyService.showSuccess('Successfully approved...');
            $location.path('/convert');
        }, function (res) {
            $log.debug(res);
            wydNotifyService.showError('Approve failed. ' + res.description);
        });

        $log.info('approve finished...');
    }

    function loadImage() {
        var basePath = sessionService.getApiBasePath() + '/customers/' + vm.customer.idNo;
        if (vm.customer.idType == 'Passport') {
            var path = basePath + 'images/' + vm.customer.images.Front;
            var req = {
                method: 'GET',
                url: path,
                headers: {'api-key': $rootScope.sessionId}
            };
            //$log.info(req);
            $http(req).then(function (res) {
                $log.info(res);
                if (res.status === 200) {
                    vm.passportFrontImage = res.data;
                }
            }, function (res) {
                $log.error(res);
            });
        }
        if (vm.customer.idType == 'NRIC') {
            var path = basePath + 'images/' + vm.customer.images.Front;
            var req = {
                method: 'GET',
                url: path,
                headers: {'api-key': $rootScope.sessionId}
            };
            //$log.info(req);
            $http(req).then(function (res) {
                $log.info(res);
                if (res.status === 200) {
                    vm.nricFrontImage = res.data;
                }
            }, function (res) {
                $log.error(res);
            });

            var path = basePath + 'images/' + vm.customer.images.Back;
            req = {
                method: 'GET',
                url: path,
                headers: {'api-key': $rootScope.sessionId}
            };
            //$log.info(req);
            $http(req).then(function (res) {
                $log.info(res);
                if (res.status === 200) {
                    vm.nricBackImage = res.data;
                }
            }, function (res) {
                $log.error(res);
            });
        }
    }

    function init() {
        $log.info('init started...');
        vm.customers = storageService.getCustomers();
        vm.customer = sessionService.currentCustomer;
        if (!vm.customer) {
            vm.customer = vm.customers[vm.customers.length - 1];
            vm.name = vm.customer.customerName;
            //loadImage();
            onCustomerChange();
        }
        console.log(vm.customer);
        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        onCustomerChange: onCustomerChange,
        save: save,
        approve: approve
    });

    init();

    $log.info(cmpId + 'finished...');
}
cddController.$inject = ['$log', '$rootScope', '$scope', '_session', 'wydNotifyService', 'storageService', 'sessionService', '$http', 'Upload', '$location'];
cddController.resolve = {
    '_session': ['sessionService', function (sessionService) {
        //sessionService.switchOffAutoComplete();
        return '-:coming_soon:-';
        //return sessionService.getCurrentSession();
    }]
};
appControllers.controller('cddController', cddController);

function convertController($log, $rootScope, $scope, _session, wydNotifyService, storageService, sessionService, $http, $location) {
    var cmpId = 'convertController', cmpName = 'Convert Customer';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function onCustomerChange() {
        sessionService.getCustomer(vm.customer.idNo).then(function (res) {
            _.assign(vm.customer, res);
            $log.info(vm.customer);
            computeImageUrls();
        });
    }

    function computeImageUrls() {
        if (vm.customer.images.Front) {
            var imgUrl = sessionService.getApiBasePath() + '/customers/';
            imgUrl += vm.customer.idNo + '/images/';
            imgUrl += vm.customer.images.Front;
            imgUrl += '?api-key=' + $rootScope.sessionId;
            vm.customer.imageFrontUrl = imgUrl;
            console.log(vm.customer.imageFrontUrl);
        }
        if (vm.customer.images.Back) {
            var imgUrl = sessionService.getApiBasePath() + '/customers/';
            imgUrl += vm.customer.idNo + '/images/';
            imgUrl += vm.customer.images.Back;
            imgUrl += '?api-key=' + $rootScope.sessionId;
            vm.customer.imageBackUrl = imgUrl;
            console.log(vm.customer.imageBackUrl);
        }
        //if (vm.customer.images.Signature) {
        //    var imgUrl = sessionService.getApiBasePath() + '/customers/';
        //    imgUrl += vm.customer.idNo + '/images/';
        //    imgUrl += vm.customer.images.Signature;
        //    imgUrl += '?api-key=' + $rootScope.sessionId;
        //    vm.customer.imageSignatureUrl = imgUrl;
        //    console.log(vm.customer.imageSignatureUrl);
        //}
    }

    function validateCustomer() {
        $log.info('validate customer started...');

        wydNotifyService.hide();

        var params = {url: 'https://www.maxmoney.com/agent/validate', status: 'Validated'};
        sessionService.validateCustomer(vm.customer.idNo, params).then(function (res) {
            $log.debug(res);
            // wydNotifyService.showSuccess('Successfully validated...');
            if (res.status === 204) {
                convertCustomer();
            }
        }, function (res) {
            $log.debug(res.value);
            wydNotifyService.showError('Validation failed. ' + res.description);
        });

        $log.info('validate customer finished...');
    }

    function convertCustomer() {
        $log.info('convert customer started...');

        var params = {id: vm.customer.idNo, password: vm.customer.password};
        //var params = {id: vm.customer.idNo, password: '123456'};
        sessionService.convertCustomer(params).then(function (res) {
            $log.debug(res);
            if (res.status === 201) {
                updateUserInfo();
                swal({
                    type: 'success',
                    title: 'Customer Created.',
                    text: 'Your MaxMoney Id is ' + res.data.maxMoneyId,
                    allowOutsideClick: false
                }).then(
                    function () {
                        $scope.$apply(function () {
                            $location.path('/sign-up');
                        });
                    }
                );
            }
        }, function (res) {
            $log.debug(res);
            wydNotifyService.showError('Conversion failed. ' + res.description);
        });

        $log.info('convert customer finished...');
    }

    function updateUserInfo() {
        $log.debug('update user info started...');
        sessionService.updateSourceOfIncomeAndNatureOfBusinessForUser(vm.customer.email, vm.customer.sourceOfIncomeX, vm.customer.natureOfBusinessX);
        $log.debug('update user info finished...');
    }

    function init() {
        $log.info('init started...');
        vm.customers = storageService.getCustomers();
        vm.customer = sessionService.currentCustomer;
        if (!vm.customer) {
            vm.customer = vm.customers[vm.customers.length - 1];
            vm.name = vm.customer.customerName;
        }
        onCustomerChange();
        console.log(vm.customer);
        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        onCustomerChange: onCustomerChange,
        validateCustomer: validateCustomer,
        convertCustomer: convertCustomer
    });

    init();

    $log.info(cmpId + 'finished...');
}
convertController.$inject = ['$log', '$rootScope', '$scope', '_session', 'wydNotifyService', 'storageService', 'sessionService', '$http', '$location'];
convertController.resolve = {
    '_session': ['sessionService', function (sessionService) {
        //sessionService.switchOffAutoComplete();
        return '-:coming_soon:-';
        //return sessionService.getCurrentSession();
    }]
};
appControllers.controller('convertController', convertController);
*/

function beneficiaryAddOrEditController($log, $rootScope, $scope, sessionService, $uibModalInstance, model, country) {
    var cmpId = 'beneficiaryAddOrEditController', cmpName = 'Add/Edit Beneficiary';
    $log.info(cmpId + ' started ...');

    //$rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    vm.title = 'Add Beneficiary';
    vm.payoutAgentBanks = [];
    vm.relationships = sessionService.relationships;
    vm.orderPurposes = _.keys(sessionService.orderPurposes);
    vm.agentCountries = sessionService.agentDetail.agents;


    vm.payBy = 'CP';
    vm.isCountryInitialized = false;

    if (model) {
        vm.model = model;
        vm.title = 'Edit Beneficiary';
        if (model.bankAccounts) {
            model.bankAccount = model.bankAccounts[1];
            vm.payBy = 'BD';
        } else {
            vm.payBy = 'CP';
        }
        var countryInfo = findCountryInfo(model.country);
        if (countryInfo) {
            model.dialingCode = countryInfo.dial_code;
            if (model.mobile.startsWith(countryInfo.dial_code)) {
                model.dialingNumber = model.mobile.substring(countryInfo.dial_code.length);
            }
            model.agentCountry = _.find(vm.agentCountries, function (item) {
                return item.country == model.country;
            });
            onCountryChange();
        }
    } else {
        model = {
            dialingCode: '-', bankAccount: {}
        };
        vm.payBy = 'CP';
        if (country) {
            var countryInfo = findCountryInfo(country);
            if (countryInfo) {
                vm.isCountryInitialized = true;
                model.country = country;
                model.dialingCode = countryInfo.dial_code;
                model.agentCountry = _.find(vm.agentCountries, function (item) {
                    return item.country == model.country;
                });
                onCountryChange();
            }
        }
        vm.model = model;
    }
    $log.debug(vm.model);

    $scope.$on('session:relationships', function (event, data) {
        vm.relationships = sessionService.relationships;
    });

    $scope.$on('session:orderPurposes', function (event, data) {
        vm.orderPurposes = sessionService.orderPurposes;
    });

    $scope.$on('session:agents', function (event, data) {
        vm.agentsCountries = sessionService.agentDetail.agents;
    });

    function findCountryInfo(icountry) {
        var countryInfo = _.find(sessionService.countries, function (item) {
            return item.name == icountry;
        });
        return countryInfo;
    }

    function onCountryChange() {
        sessionService.getPayoutAgentsInfo('BANK', vm.model.agentCountry.country, {size: 1000}).then(function (res) {
            res = _.uniqBy(res.locations, 'name');
            vm.payoutAgentBanks = res;
            if (vm.model.bankAccount) {
                vm.model.bankAccount.payoutAgent = _.find(vm.payoutAgentBanks, function (item) {
                    return item.code == vm.model.bankAccount.location;
                });
            }
        });
        var countryInfo = findCountryInfo(vm.model.agentCountry.country);
        if (countryInfo) {
            vm.model.dialingCode = countryInfo.dial_code;
        }
    }

    function onPayoutAgentChangeX(ov, nv) {
        if (nv) {
            vm.model.bankAccount.payoutAgent.$setValidity('required', false);
            //vm.form.bankName.$setValidity('required', false);
        } else {
            vm.model.bankAccount.payoutAgent.$setValidity('required', true);
            // vm.form.bankName.$setValidity('required', true);
        }
    }

    // function onPayBy(value) {
    //     vm.payBy = value;
    //     console.log(vm.payBy);
    // }

    function reset() {
        $log.info('reset started...');

        vm.form2.$setPristine();
        vm.payBy = 'CP';
        vm.model.agentCountry = null;
        vm.model.orderPurpose = null;
        vm.model.relationship = null;
        vm.model.bankAccount.payoutAgent = null;

        $log.info('reset finished...');
    }

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    }

    function save() {
        //wydNotifyService.hide();

        var reqBen = {}, reqBnk = {}, flag = false;

        var value = vm.model.name;
        reqBen.name = value;

        value = vm.model.address;
        if (value && value != '') {
            reqBen.address = value;
        }

        value = vm.model.agentCountry;
        reqBen.country = value.country;

        value = vm.model.dialingNumber;
        value = value.replace(new RegExp('_', 'g'), ' ').trim();
        value = vm.model.dialingCode + value;
        reqBen.mobile = value;

        value = vm.model.email;
        if (value && value != '') {
            reqBen.email = value;
        }

        value = vm.model.orderPurpose;
        reqBen.orderPurpose = value;

        value = vm.model.relationship;
        reqBen.relationship = value;

        //$log.info(reqBen);

        if (vm.payBy == 'BD') {
            value = vm.model.bankAccount.acctName;
            reqBnk.acctName = value;

            value = vm.model.bankAccount.acctNo;
            reqBnk.acctNo = value;

            if (vm.model.bankAccount.payoutAgent) {
                value = vm.model.bankAccount.payoutAgent.name;
                reqBnk.name = value;

                value = vm.model.bankAccount.payoutAgent.country;
                reqBnk.country = value;

                value = vm.model.bankAccount.payoutAgent.code;
                reqBnk.location = value;
            }

            value = vm.model.bankAccount.branch;
            reqBnk.branch = value;

            //$log.info(reqBnk);
        }

        if (!flag) {
            reqBen.name = reqBen.name.toUpperCase();

            if (vm.payBy == 'BD') {
                reqBnk.acctName = reqBnk.acctName.toUpperCase();
                reqBnk.branch = reqBnk.branch.toUpperCase();
            }

            if (vm.model.id) {
                updateBeneficiary(reqBen, reqBnk);
            } else {
                createBeneficiary(reqBen, reqBnk);
            }
        }
        // $uibModalInstance.close('save');
    }

    function createBeneficiary(reqBen, reqBnk) {
        $log.info('create beneficiary...');
        $log.info(reqBen);
        sessionService.createBeneficiary(reqBen).then(function (res) {
            $log.info(res);
            vm.resModel = res.data;
            vm.model.id = vm.resModel.id;
            if (vm.payBy == 'BD') {
                createBeneficiaryBankAccount(reqBnk);
            } else {
                $uibModalInstance.close(vm.resModel);
            }
        });
    }

    function createBeneficiaryBankAccount(reqBnk) {
        $log.info('create beneficiary bank account...');
        $log.info(reqBnk);
        sessionService.createBeneficiaryBankAccount(vm.model.id, reqBnk).then(function (res) {
            $log.info(res);
            vm.resModel = res.data;
            $uibModalInstance.close(vm.resModel);
        });
    }

    function updateBeneficiary(reqBen, reqBnk) {
        $log.info('update beneficiary...');
        $log.info(reqBen);
        sessionService.updateBeneficiary(vm.model.id, reqBen).then(function (res) {
            $log.info(res);
            if (vm.payBy == 'BD') {
                deleteAndUpdateBeneficiaryBankAccount(reqBnk);
            } else {
                $uibModalInstance.close(vm.resModel);
            }
        });
    }

    function deleteAndUpdateBeneficiaryBankAccount(reqBnk) {
        $log.info('delete beneficiary bank account...');
        sessionService.deleteBeneficiaryBankAccount(vm.model.id, {index: 1}).then(function (res) {
            $log.info(res);
            createBeneficiaryBankAccount(reqBnk);
        });
    }

    function init() {
        $log.info('init started...');

        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        onCountryChange: onCountryChange,
        onPayoutAgentChangeX: onPayoutAgentChangeX,
        reset: reset,
        cancel: cancel,
        save: save
    });

    init();

    $log.info(cmpId + 'finished...');
}
beneficiaryAddOrEditController.$inject = ['$log', '$rootScope', '$scope', 'sessionService', '$uibModalInstance', 'model', 'country'];
appControllers.controller('beneficiaryAddOrEditController', beneficiaryAddOrEditController);
