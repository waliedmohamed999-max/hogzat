<?php

namespace App\Controllers\Api;

class ReferralController extends APIController
{
    public function hostProgram()
    {
        $payload = [
            'headline' => 'Invite hosts and earn rewards',
            'subtitle' => 'Share your link and get rewards when friends join.',
            'button_label' => 'Copy referral link',
            'terms_text' => 'By sharing, you agree to the referral terms.',
            'terms_link_label' => 'View terms',
            'share_url' => url('/'),
            'options' => [
                [
                    'id' => 1,
                    'title' => 'Invite a host',
                    'subtitle' => 'Earn credits when they publish a listing.',
                    'reward_text' => '+50',
                    'icon' => 'megaphone',
                ],
                [
                    'id' => 2,
                    'title' => 'Invite a guest',
                    'subtitle' => 'Earn credits when they complete a booking.',
                    'reward_text' => '+20',
                    'icon' => 'balloon',
                ],
            ],
        ];

        return $this->sendJson([
            'status' => 1,
            'data' => $payload,
        ]);
    }
}
