"use strict";

var contactsWorker = {
    contactsCache: {},

    initEvents: function () {
        var me = this;

        $('#addContactBtn').off('click').click(function () {

        });

        var contacts = me._getContactsFromServer();
        me._buildContactsTable(contacts);
    },

    _buildContactsTable: function (contacts) {
        if (!contacts || contacts.length === 0) return;
    },

    _getContactsFromServer: function () {

    },

    getContact: function (id) {
        var me = this;

        if (!id) return;

        if (me.contactsCache.hasOwnProperty(id)) { // contact is in cache , no need to make call to server

        } else { // get contact from server

        }

    },

    addContact: function () {

    }
};
