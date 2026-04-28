<?php

namespace App\Controllers\Api;

use Illuminate\Http\Request;

class CohostController extends APIController
{
    public function search(Request $request)
    {
        $payload = [
            'title' => 'Find a cohost',
            'subtitle' => 'We will notify you when cohosts are available.',
            'empty_title' => 'No cohosts found',
            'empty_body' => 'Try a different location or request availability.',
            'notify_button_label' => 'Notify me',
            'results' => [],
        ];

        return $this->sendJson([
            'status' => 1,
            'data' => $payload,
        ]);
    }

    public function notify(Request $request)
    {
        return $this->sendJson([
            'status' => 1,
        ]);
    }
}
