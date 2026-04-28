@include('frontend.components.header-blank', ['bodyClass' => 'authentication-bg authentication-bg-pattern'])
<style>
    
.digit-group input {
    width: 60px;
    height: 55px;
    border-radius: 13px;
    background-color: #ffffff;
    line-height: 50px;
    text-align: center;
    font-size: 24px;
    font-weight: 400;
    color: #3c3c3c;
    margin: 0 2px;
    border: 1px solid #e2e1e1;
    box-shadow: rgb(0 0 0 / 15%) 0px 1px 5px;
    /* border-radius: 0.65rem; */
}
</style>
<div class="account-pages mt-5 mb-5">
    <div class="container" >
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6 col-xl-5">
                <div class="card bg-pattern mt-5">
                    <div class="card-body p-4">
                        <div class="mt-3 text-center">
                                  
                <div class="modal-body">
                     <label for="email-address-reset-pass-form" >{{__('sent a message to the number')}}{{$mobile}}<span id="SendMobile"> </span></label>
                    <form id="hh-reset-password-form" action="{{ url('auth/login') }}" method="post"
                          data-validation-id="form-reset-password"
                          data-reload-time="1500"
                          class="form form-action">
                        @include('common.loading')
                        <div class="form-group digit-group">
                            <input class="form-control has-validation"  type="hidden"
                            id="email-address-reset-pass-form" value="1" name="checkurl" >
                            
                            <input class="form-control has-validation"  type="hidden"
                            id="email-address-reset-pass-form" value="{{$mobile}}" name="mobile" >

                        <input type="text" id="digit-1" name="digit1" data-previous="digit-2" maxlength="1">
                                    <input type="text" id="digit-2" name="digit2" data-next="digit-1" data-previous="digit-3" maxlength="1" >
                                    <input type="text" id="digit-3" name="digit3" data-next="digit-2" data-previous="digit-4" maxlength="1">
                                    <input type="text" id="digit-4" name="digit4" data-next="digit-3" maxlength="1" >
                                    
                        </div>
                        <div class="form-group  text-center">
                            <button class="btn btn-primary btn-block text-uppercase code"
                                    type="submit"> {{__('check')}}</button>
                        </div>
                         <div class="form-group mb-0 text-center">
                               <div>{{__('If you check the verification code you can do')}} 
                               <span id="time" style="color: red;">02:00</span>
                               <button class="btn btn-primary btn-block text-uppercase resendcode" id="submitCode" style="display: none;    background: #f4f4f5;border-color: #dad9dd;color: #5a409b;"> {{__('Resend Code')}}</button>
                               </div>
    
                          
                        </div>
                        
                        <div class="form-message"></div>
                    </form>
                </div>
                            <a href="{{url('/')}}"
                               class="btn btn-block btn-pink waves-effect waves-light mt-3">{{__('Back to Home')}}</a>
                        </div>

                    </div> <!-- end card-body -->
                </div>
                <!-- end card -->
            </div> <!-- end col -->
        </div>
        <!-- end row -->
    </div>
    <!-- end container -->
</div>

<footer class="footer footer-alt">
    {!! balanceTags(get_option('copy_right')) !!}
</footer>
@include('frontend.components.footer-blank')
