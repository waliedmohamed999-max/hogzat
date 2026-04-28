<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddEndTimeLastToLastMinuteTable extends Migration
{
    public function up()
    {
        if (Schema::hasTable('last_minute') && !Schema::hasColumn('last_minute', 'end_time_last')) {
            Schema::table('last_minute', function (Blueprint $table) {
                $table->bigInteger('end_time_last')->nullable()->after('start_time_last');
            });
        }
    }

    public function down()
    {
        if (Schema::hasTable('last_minute') && Schema::hasColumn('last_minute', 'end_time_last')) {
            Schema::table('last_minute', function (Blueprint $table) {
                $table->dropColumn('end_time_last');
            });
        }
    }
}
