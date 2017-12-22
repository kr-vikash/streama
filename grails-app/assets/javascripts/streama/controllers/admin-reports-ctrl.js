//= wrapped

angular.module('streama').controller('adminReportsCtrl', [
  'apiService', '$state', '$rootScope', '$filter', '$filter', function (apiService, $state, $rootScope, $filter) {
    var vm = this;
    vm.selectedReports = [];
    vm.showReports = {};
    vm.maxPerPage = 5;
    vm.offset = 0;
    vm.pagination = {};
    vm.resolveMultiple = resolveMultiple;
    vm.resolve = resolve;
    vm.unresolve = unresolve;
    vm.pageChanged = pageChanged;
    vm.refreshList = refreshList;
    vm.initialLoad = initialLoad;
    vm.loadReports = loadReports;
    vm.addOrRemoveFromSelection = addOrRemoveFromSelection;

    function pageChanged () {
      var newOffset = vm.maxPerPage*(vm.pagination.currentPage-1);
      vm.loadReports({max: vm.maxPerPage, filter: vm.listFilter, offset: newOffset});
    }

    function refreshList (filter) {
      vm.listFilter = filter;
      loadReports({max: vm.maxPerPage, filter: filter, offset: vm.offset});
    }

    function initialLoad () {
      apiService.report.list()
        .then(function (reports) {
          console.log(reports);
          vm.reports = reports.data;
          vm.reportsCount = vm.reports.length;
        }, function () {
          alertify.error('An error occurred.');
        });
    }

    function loadReports (params) {
      vm.reports = [];
      apiService.report.list(params)
        .then(function (reports) {
          console.log(reports);
          vm.reports = reports.data;
        }, function () {
          alertify.error('An error occurred.');
        });
    }

    function addOrRemoveFromSelection($event, report) {
      if($event.target.checked && report.resolved === false) {
        vm.selectedReports.push(report.id);
      } else {
        _.remove(vm.selectedReports, function(id) {
          return id === report.id;
        });
      }
    }

    function resolve(oldReport) {
      apiService.report.resolve(oldReport.id).then
      (function (response) {
          var newReport = response.data;
          oldReport.resolved = newReport.resolved;
          oldReport.lastUpdated = newReport.lastUpdated;
        alertify.success('Selected report has been resolved.');
      }, function () {
        alertify.error('Report could not be resolved.');
      });
      }

    function unresolve(oldReport) {
      apiService.report.unresolve(oldReport.id).then
      (function (response) {
          var newReport = response.data;
          oldReport.resolved = newReport.resolved;
          oldReport.lastUpdated = newReport.lastUpdated;
        alertify.success('Selected report has been unresolved.');
      }, function () {
        alertify.error('Report could not be unresolved.');
      });
    }

    function resolveMultiple() {
      if(vm.selectedReports.length > 0) {
        var confirmText = "This will resolve all selected reports. Do you want to proceed?";
        alertify.set({ buttonReverse: true, labels: {ok: "Yes", cancel : "Cancel"}});
        alertify.confirm(confirmText, function (confirmed) {
          if(confirmed){
            apiService.report.resolveMultiple(vm.selectedReports).then
            (function (response) {
              var newReports = response.data;
              _.forEach(newReports, function (newReport) {
                _.forEach(vm.reports, function (oldReport) {
                  if (newReport.id === oldReport.id) {
                    oldReport.resolved = newReport.resolved;
                    oldReport.lastUpdated = newReport.lastUpdated;
                  }
                });
              });
              vm.selectedReports = [];
              alertify.success('Selected reports have been resolved.');
            }, function () {
              alertify.error('Reports could not be resolved.');
            });
          }
        });
      } else alertify.error('No reports selected.');
    }
    vm.initialLoad();
  }]);


