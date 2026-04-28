<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LastMinute;

class LastMinuteCron extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'LastMinuteCron:cron';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {date_default_timezone_set("Asia/Riyadh");
         $ldate = date('H');
        
             if($ldate==16)
             {
                 $deleteItem= new LastMinute(); 
                $deleteItem->checkItemAndDelete();
             }
    }
}
