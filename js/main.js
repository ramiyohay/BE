"use strict";

var contactsWorker = {
    contactsCache: {},

    _addContactToTable: function (contact) {
        var me = this;
        var tdName = '<td>' + contact.fname + ' ' + contact.lname + '</td>';
        var tdImage = contact.base64 ? '<td><img width=30 height=30 src="' + contact.base64 + '" alt=""></td>' : '<td></td>';

        $("#contactsTable").find('tbody').append('<tr data-id="' + contact.id + '">' + tdImage + tdName + '</tr>');

        me.contactsCache[contact.id] = contact;
    },

    _centerDialog: function (dialog) {
        dialog.css({
            'margin-top': function () {
                var w = $(window).height();
                var b = $(".modal-dialog").height();
                var h = (w - b) / 2;
                return h + "px";
            }
        });
    },

    _showLoadingDialog: function (msg) {
        var me = this;
        var dialog = bootbox.dialog({
            message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i> ' + (msg ? msg : 'Loading...') + '</div>',
            closeButton: false
        });

        me._centerDialog(dialog);
    },

    _showAlert: function (msg) {
        var me = this;
        var dialog = bootbox.alert({
            message: msg,
            closeButton: false
        });

        me._centerDialog(dialog);
    },

    readURL: function (input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('.modal-content #contactImage').attr('src', e.target.result);
            };

            reader.readAsDataURL(input.files[0]);
        }
    },

    initEvents: function () {
        var me = this;

        $('#addContactBtn').off('click').click(function () {
            me._showAddContactForm();
        });

        me._getContactsFromServer();
    },

    _buildContactsTable: function (contacts) {
        var me = this;

        if (!contacts || contacts.length === 0) return;

        if (contacts) {
            contacts.forEach(function (contact) {
                me._addContactToTable(contact);
            });

            $(document).on('click', '#contactsTable tbody tr', function () {
                me.getContact($(this).data('id'));
            });
        }
    },

    _getContactsFromServer: function () {
        var me = this;

        me._showLoadingDialog();

        $.ajax({
            url: "http://127.0.0.1:8081/api/all",
            type: 'post',
            dataType: 'json',
            complete: function (xhr, status) {
                bootbox.hideAll();

            },
            success: function (result, status, xhr) {
                if (status === 'success') {
                    me._buildContactsTable(result);
                } else {
                    me._showAlert('Error getting contacts data !');
                }
            },
            error: function (xhr, status, error) {
                if (error) {
                    me._showAlert('Error getting contacts data !');
                    console.error('Error getting contacts data !');
                }
            }
        });

    },

    _showAddContactForm: function () {
        var me = this;

        var dialog = bootbox.dialog({
            title: '',
            onEscape: true,
            backdrop: true,
            message: $("#contactForm").html()
        });


        $('.modal-content #saveContactBtn').off('click').click(function () {
            me._addContact();
        });

    },

    _showContactDetails: function (contact) {
        var me = this;
        var dialog = bootbox.dialog({
            title: '',
            onEscape: true,
            backdrop: true,
            closeButton: false,
            className: 'detais',
            message: $("#contactDetailsWrapper").html()
        });

        $('.modal-content h1').html(contact.fname + ' ' + contact.lname);
        $('.modal-content #phone').html(contact.phone);
        $('.modal-content #email').html(contact.email);

        if (contact.base64 && contact.base64.length > 0) {
            $('.modal-content img').attr('src', contact.base64);
        } else {
            $('.modal-content h1').parents('.column:first').removeClass('column');
            $('.modal-content h1').css('text-align', 'center');
            $('.modal-content img').parents('.column:first').hide();
            $('.detais .modal-body').css('height', '200px');
        }
    },

    getContact: function (id) {
        var me = this;

        if (!id) return;

        if (me.contactsCache.hasOwnProperty(id)) { // contact is in cache , no need to make a call to to the server
            var contact = me.contactsCache[id];

            me._showContactDetails(contact);
        } else { // get contact from server
            $.ajax({
                url: "http://127.0.0.1:8081/api/contact/" + id,
                type: 'post',
                /*headers: {
                    "Access-Control-Allow-Origin": '*', //If your header name has spaces or any other char not appropriate                   
                    "Access-Control-Allow-Headers": 'Origin,Content-Type,Authorization,X-Auth-Token', //If your header name has spaces or any other char not appropriate 
                    "Access-Control-Allow-Methods": 'GET,POST' //If your header name has spaces or any other char not appropriate 
                },*/
                dataType: 'json',
                complete: function (xhr, status) {
                    bootbox.hideAll();

                },
                success: function (result, status, xhr) {
                    me._showContactDetails(result);
                    me.contactsCache[contact.id] = contact;
                },
                error: function (xhr, status, error) {
                    if (error) {
                        me._showAlert('Error getting contact data !');
                        console.error('Error getting contact data !');
                    }
                }
            });

        }
    },

    _addContact: function () {
        var me = this;
        var fname = $('.modal-content #fname').val();
        var lname = $('.modal-content #lname').val();
        var phone = $('.modal-content #phone').val();
        var email = $('.modal-content #email').val();
        var base64 = $('.modal-content img').attr('src');
        var errors = 0;

        if (!fname || fname.trim === '') {
            $('.modal-content #fname').addClass('required');
            errors++;
        } else {
            $('.modal-content #fname').removeClass('required');
        }

        if (!lname || lname.trim === '') {
            $('.modal-content #lname').addClass('required');
            errors++;
        } else {
            $('.modal-content #lname').removeClass('required');
        }

        if (!phone || phone.trim === '') {
            $('.modal-content #phone').addClass('required');
            errors++;
        } else {
            $('.modal-content #phone').removeClass('required');
        }

        if (errors === 0) {
            me._showLoadingDialog('Saving contact...');

            $.ajax({
                url: "http://127.0.0.1:8081/api/add/",
                type: 'post',
                dataType: 'json',
                data: {
                    fname: fname,
                    lname: lname,
                    phone: phone,
                    email: email ? email : null,
                    base64: base64 ? base64 : null
                },
                complete: function (xhr, status) {},
                success: function (result, status, xhr) {
                    bootbox.hideAll();

                    me._addContactToTable({
                        id: result.id,
                        fname: result.fname,
                        lname: result.lname,
                        phone: result.phone,
                        email: result.email,
                        base64: result.base64
                    });
                },
                error: function (xhr, status, error) {
                    if (error) {
                        me._showAlert('Error adding contact !');
                        console.error('Error adding contact !');
                    }
                }
            });
        }
    }
};
