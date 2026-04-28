<?php

namespace App\Controllers\Api;

use App\Services\Finance\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends APIController
{
    public function intent(Request $request)
    {
        $rules = [
            'booking_id' => 'required|integer',
            'method' => 'required|string',
        ];
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return $this->sendJson([
                'status' => 0,
                'message' => $validator->errors(),
            ]);
        }
        return $this->sendJson(app(PaymentService::class)->createIntent(
            (int)$request->get('booking_id'),
            (string)$request->get('method'),
            (string)$request->get('booking_table', 'booking')
        ));
    }

    public function checkout(Request $request)
    {
        $rules = [
            'booking_id' => 'required|integer',
            'method' => 'required|string',
        ];
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return $this->sendJson([
                'status' => 0,
                'message' => $validator->errors(),
            ]);
        }
        return $this->sendJson(app(PaymentService::class)->createIntent(
            (int)$request->get('booking_id'),
            (string)$request->get('method'),
            (string)$request->get('booking_table', 'booking')
        ));
    }

    public function webhook(Request $request)
    {
        $gateway = (string)$request->get('gateway', 'stripe');
        return $this->sendJson(app(PaymentService::class)->handleWebhook($gateway, $request));
    }
}
