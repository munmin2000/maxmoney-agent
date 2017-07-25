function signUpController($log, $rootScope, $scope, _session, wydNotifyService, storageService, sessionService, $uibModal, $location) {
    var cmpId = 'signUpController', cmpName = 'Sign Up';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    var dnationality = {name: '-', dial_code: '-', code: '-', nationality: '<Select Nationality>'};

    vm.countries = sessionService.countries;
    vm.malasiyaStates = sessionService.malasiyaStates;

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
        if(vm.dob) {
            vm.dobx = moment(vm.dob, 'DDMMYYYY');
            validateDob();
        }
    }

    function onDobChangeX(nv, ov) {
        //console.log(ov);
        //console.log(nv);
        if(nv) {
            vm.dob = nv.format('DDMMYYYY');
            validateDob();
        }
    }

    function onNationalityChange() {
        vm.dialCode = vm.nationality.dial_code;
    }

    function onNationalityChangeX(ov, nv) {
        if(nv) {
            vm.dialCode = nv.dial_code;
            vm.form.nationality.$setValidity('required', false);
           // $log.info('ov value is : ', ov);
        } else {
            vm.dialCode = '-';
            vm.form.nationality.$setValidity('required', true);
        }
    }

    function onStateChangeX(ov, nv) {
        if(nv) {
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
        $log.info("reset started...");

        vm.form.$setPristine();
        vm.beneficiary = {id: 'NA'};
        vm.beneficiaryLabel = 'Add';
        vm.dialCode = '-'

        $log.info("reset started...");
    }

    function save() {
        $log.info("saving started...");

        if (vm.form.$pristine) {
            alertify.alert("There is no change. Hence, nothing to save.");
            return;
        }

        var reqCus = {};

        var value = vm.name;
        reqCus.customerName = value;

        value = vm.emailId;
        reqCus.email = value;

        value = vm.mobileNo;
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

        sessionService.signUp(reqCus).then(function (res) {
            $log.info(res);
            sessionService.currentCustomer = res.data;
            storageService.saveCustomer(res.data);
            wydNotifyService.showSuccess('Successfully signed up...');
            $location.path('/cdd');
            //reset();
        }, function (res) {
            $log.info(res);
            wydNotifyService.showError(res.data.description);
        });

        $log.info("saving finished...");
    }

    function init() {
        $log.info("init started...");

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

        $log.info("init finished...");
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
        reset: reset
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

function cddController($log, $rootScope, $scope, _session, wydNotifyService, storageService, sessionService, $http, Upload) {
    var cmpId = 'cddController', cmpName = 'CDD';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function save() {
        $log.info('saving started...');

        var path = sessionService.getApiBasePath() + '/customers/' + vm.customer.idNo;
        var reqData = {'idType': vm.customer.idType};
        if (vm.customer.idType == 'Passport') {
            if(!vm.passportFront && !vm.passportBack) {
                wydNotifyService.showWarning('There is nothing to update...');
                return;
            }
            if(vm.passportFront) {
                reqData['front'] = vm.passportFront;
            }
            if(vm.passportBack) {
                reqData['back'] = vm.passportBack;
            }
        }
        if (vm.customer.idType == 'NRIC') {
            if(!vm.nricFront && !vm.nricFront) {
                wydNotifyService.showWarning('There is nothing to update...');
                return;
            }
            if(vm.nricFront) {
                reqData['front'] = vm.nricFront;
            }
            if(vm.nricBack) {
                reqData['back'] = vm.nricBack;
            }
        }
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
        }, function (res) {
            $log.debug(res);
            $log.error('Error Status: ' + res.status);
        }, function (evt) {
            $log.debug(evt);
            var pp = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            if (vm.customer.idType == 'Passport') {
                vm.passportFront.progress = pp;
                vm.passportBack.progress = pp;
            }
            if (vm.customer.idType == 'NRIC') {
                vm.nricFront.progress = pp;
                vm.nricBack.progress = pp;
            }
            $log.info('Progress: ' + pp + '% ');
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

        $log.info('saving finished...');
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
        $log.info("init started...");
        vm.customers = storageService.getCustomers();
        vm.customer = sessionService.currentCustomer;
        if (!vm.customer) {
            vm.customer = vm.customers[vm.customers.length - 1];
            vm.name = vm.customer.customerName;
            //loadImage();
        }
        //console.log(vm.customer);
        $log.info("init finished...");
    }

    angular.extend(this, {
        uiState: uiState,
        save: save
    });

    init();

    $log.info(cmpId + 'finished...');
}
cddController.$inject = ['$log', '$rootScope', '$scope', '_session', 'wydNotifyService', 'storageService', 'sessionService', '$http', 'Upload'];
cddController.resolve = {
    '_session': ['sessionService', function (sessionService) {
        //sessionService.switchOffAutoComplete();
        return '-:coming_soon:-';
        //return sessionService.getCurrentSession();
    }]
};
appControllers.controller('cddController', cddController);

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
        if(nv) {
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
        $log.info("reset started...");

        vm.form.$setPristine();

        $log.info("reset started...");
    }

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    }

    function save() {
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
        $log.info("init started...");

        $log.info("init finished...");
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


/*
 function homeController($log, $rootScope, $scope, _session) {
 var cmpId = 'homeController', cmpName = 'Home';
 $log.info(cmpId + ' started ...');

 $rootScope.viewName = cmpName;

 var vm = this;
 vm.isReady = false;

 vm.session = _session;

 $log.info(cmpId + 'finished...');
 }
 homeController.$inject = ['$log', '$rootScope', '$scope', '_session'];
 homeController.resolve = {
 '_session': ['sessionService', function (sessionService) {
 return sessionService.getCurrentSession();
 }]
 };
 appControllers.controller('homeController', homeController);

 function customerToUserController($log, $rootScope, $scope, _session) {
 var cmpId = 'customerToUserController', cmpName = 'Customer To User';
 $log.info(cmpId + ' started ...');

 $rootScope.viewName = cmpName;

 var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

 function init() {
 $log.info("init started...");

 $log.info("init finished...");
 }

 angular.extend(this, {
 uiState: uiState
 });

 init();

 $log.info(cmpId + 'finished...');
 }
 customerToUserController.$inject = ['$log', '$rootScope', '$scope', '_session'];
 customerToUserController.resolve = {
 '_session': ['sessionService', function (sessionService) {
 return sessionService.getCurrentSession();
 }]
 };
 appControllers.controller('customerToUserController', customerToUserController);

 function beneficiaryListController($log, $rootScope, _session, $uibModal) {
 var cmpId = 'beneficiaryListController', cmpName = 'Beneficiaries';
 $log.info(cmpId + ' started ...');

 $rootScope.viewName = cmpName;

 var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

 function addBeneficiary() {

 var modalInstance = $uibModal.open({
 ariaLabelledBy: 'modal-title',
 ariaDescribedBy: 'modal-body',
 templateUrl: 'app/bootstrap/beneficiaryAddOrEdit.html',
 controller: 'beneficiaryAddOrEditController',
 controllerAs: 'vm',
 size: 'lg',
 resolve: {
 model: function () {
 return null;
 },
 country: function () {
 return null;
 }
 }
 });
 modalInstance.result.then(function (result) {
 $log.info('beneficiary created successfully...');
 //loadBeneficiaries();
 }, function () {
 $log.info('canceled beneficiary creation...');
 });

 }

 function init() {
 $log.info("init started...");

 $log.info("init finished...");
 }

 angular.extend(this, {
 uiState: uiState,
 addBeneficiary: addBeneficiary
 });

 init();

 $log.info(cmpId + 'finished...');
 }
 beneficiaryListController.$inject = ['$log', '$rootScope', '_session', '$uibModal'];
 beneficiaryListController.resolve = {
 '_session': ['sessionService', function (sessionService) {
 return sessionService.getCurrentSession();
 }]
 };
 appControllers.controller('beneficiaryListController', beneficiaryListController);
 */