<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Agreement extends Model
{
    protected $table = 'agreement';
    protected $primaryKey = 'ID';

    public function createAgreement($data = [])
    {
        return DB::table($this->getTable())->insertGetId($data);
    }

    public function updateAgreement($agreement_id, $data)
    {
        return DB::table($this->getTable())->where('id', $agreement_id)->update($data);
    }

    public function getAgreement($user_id)
    {
        return DB::table($this->getTable())->where('user_id', $user_id)->first();
    }

}
