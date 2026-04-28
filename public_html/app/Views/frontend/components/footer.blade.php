<?php
$logo_footer = get_option('footer_logo');
if (empty($logo_footer)) {
    $logo_footer = get_option('logo');
}
$list_social = get_option('list_social');
$screen = current_screen();
$setup_mailc_api = get_option('mailchimp_api_key');
$setup_mailc_list_id = get_option('mailchimp_list');
enqueue_script('nice-select-js');
enqueue_style('nice-select-css');
?>
</div>
<footer id="footer" class="{{ $screen == 'home-search-result' ? 'hide-footer' : '' }}">
    <div class="container labayh-footer-shell" style="background: url('{{ asset('map.caeeab2f.png') }}');">
        <div class="row">
            <div class="col-lg-2 col-md-12 labayh-footer-brand text-center">
                @if(!empty($logo_footer))
                    <img src="{{ get_attachment_url($logo_footer) }}" alt="footer logo" class="footer-logo"/>
                @endif
            </div>
            <div class="col-lg-8 col-md-12 labayh-footer-links">
                <div class="row">
                    <div class="col-lg-2 col-md-12 labayh-footer-menu">
                        <h4 class="footer-title">{{ get_option('footer_menu1_label') }}</h4>
                        <?php
                        $menu_id = get_option('footer_menu1');
                        get_nav_by_id($menu_id);
                        ?>
                    </div>
                    <div class="col-lg-3 col-md-12 labayh-footer-menu">
                        <h4 class="footer-title">{{ get_option('footer_menu2_label') }}</h4>
                        <?php
                        $menu_id = get_option('footer_menu2');
                        get_nav_by_id($menu_id);
                        ?>
                    </div>
                    <div class="col-lg-6 col-md-12 labayh-footer-support">
                        <h4 class="footer-title">{{ __('Asked assistant') }}</h4>
                        <div class="row">
                            <div class="col-md-3 labayh-support-avatar">
                                <img
                                    data-src="{{ asset('/images/operator-27@2x.png') }}"
                                    src="{{ asset('/images/operator-27@2x.png') }}"
                                    data-was-processed="true"
                                >
                            </div>
                            <div class="col-md-9 labayh-support-copy">
                                <p class="mb-0 small"><i class="fas fa-phone ifot"></i>509095816 (966+)</p>
                                <p class="mb-0 small"><i class="fas fa-calendar-alt ifot"></i>{{ __('from Saturday to Thursday') }}</p>
                                <p class="mb-0 small"><i class="fas fa-clock ifot"></i>{{ __('From 9 am to 9 pm') }}</p>
                                <p class="mb-0 small"><i class="fas fa-map-marker-alt ifot"></i>{{ __('King Fahd Road - Al-Washam, Riyadh 12735 - Al-Washam Tower - Sixth Floor - Blajat Offices') }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-2 col-md-12 labayh-footer-app">
                <div class="col-md-12 send-link">
                    <label for="footerPhone" class="form-label colorWhite">{{ __('Send the app link to the number') }}</label>
                    <div class="d-flex">
                        <input type="text" id="footerPhone" name="mobile" class="form-control" placeholder="{{ __('Mobile number') }}" required>
                        <button class="btn btn-sendSms" type="button"><i class="far fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
        </div>

        <div class="copy-right d-flex align-items-center justify-content-between labayh-footer-bottom">
            <div class="row w-100">
                <div class="col-md-6">
                    <div class="clearfix labayh-footer-copy">
                        {!! balanceTags(get_option('copy_right')) !!}
                    </div>
                </div>
                <div class="col-md-3">
                    @if(!empty($list_social))
                        <ul class="social">
                            @foreach($list_social as $item)
                                <li>
                                    <a href="{{ $item['social_link'] }}">
                                        {!! get_icon($item['social_icon']) !!}
                                    </a>
                                </li>
                            @endforeach
                        </ul>
                    @endif
                </div>
                <div class="col-md-3">
                    <img data-src="{{ asset('/images/pay.png') }}" class="img-fluid"
                         loading="lazy" src="{{ asset('/images/pay.png') }}" data-was-processed="true">
                </div>
            </div>
        </div>
    </div>
</footer>
</div>
<?php do_action('footer'); ?>
<?php do_action('init_footer'); ?>
<?php do_action('init_frontend_footer'); ?>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.countdown/2.2.0/jquery.countdown.min.js"></script>

<script src="{{asset('js/frontend.js')}}"></script>
@yield('js')
<script>
    $(".btn-sendSms").on('click', function () {
        $('.btn-sendSms').prop('disabled', true);
        var fd = new FormData();
        fd.append('mobile', $('#footerPhone').val());

        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });

        $.ajax({
            type: 'POST',
            url: "/sendDownloadLink",
            cache: false,
            data: fd,
            contentType: false,
            processData: false,
            success: (data) => {
                if (data.status === 0) {
                    $('.btn-sendSms').prop('disabled', false);
                    $.toast({
                        heading: data.title || '',
                        text: data.message,
                        icon: 'error',
                        loaderBg: '#bf441d',
                        position: 'bottom-right',
                        allowToastClose: false,
                        hideAfter: 2000
                    });
                } else {
                    $('.btn-sendSms').prop('disabled', false);
                    $('#footerPhone').val('');
                    $.toast({
                        heading: data.title || '',
                        text: data.message,
                        icon: 'success',
                        loaderBg: '#5ba035',
                        position: 'bottom-right',
                        allowToastClose: false,
                        hideAfter: 2000
                    });
                }
            },
            error: function (data) {
                console.log(data);
                $('.btn-sendSms').prop('disabled', false);
            }
        });
    });
</script>
</body>
</html>
