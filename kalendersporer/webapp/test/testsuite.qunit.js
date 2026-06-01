sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for the UI5 Application: kalendersporer",
		defaults: {
			page: "ui5://test-resources/kalendersporer/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				language: "EN",
				theme: "sap_horizon"
			},
			coverage: {
				only: "kalendersporer/",
				never: "test-resources/kalendersporer/"
			},
			loader: {
				paths: {
					"kalendersporer": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for kalendersporer"
			},
			"integration/opaTests": {
				title: "Integration tests for kalendersporer"
			}
		}
	};
});
