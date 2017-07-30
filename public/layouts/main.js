$(document).ready(function () {
    $("#deleteEvent").on('click', function (e) {
        delteId = $(this).data('delete');
        $.ajax(
            {
                url: '/events/delete/' + delteId,
                type: "delete",
                success: function (result) {

                }
            }
        );
        window.location = "/events";
    });
});