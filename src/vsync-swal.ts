import swal from "sweetalert2";

export const vswal = swal.mixin({
    heightAuto: false
});

export const toast = swal.mixin({
    toast: true,
    position: 'top-start',
    showConfirmButton: false,
    timer: 3000
});