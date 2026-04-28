<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Voit;
use App\Models\Participants;

class VoteCron extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'VoteCron:cron';

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
    {
        date_default_timezone_set("Asia/Riyadh");
        $Vote=Voit::all();
        foreach ($Vote as $key => $VoteValue) {
      
        $endDate=unserialize($VoteValue->end_date);
        $startDate=unserialize($VoteValue->start_date);
        $per=unserialize($VoteValue->per);
        $date= date("Y-m-d");

        foreach ($startDate as $key => $value) {
          
            if ( $date ==  $endDate[$key] ) {

                $count=Participants::where('experienceID',$VoteValue->experienceID)->where('showsub','on')->orderBy('count_vote', 'asc')->get();
      
                 $perRate = (int) $per[$key];
             
              
                foreach ($count as $key => $value) {
                 
                    if($perRate != 0){
                    $value->showsub = 'off';
                    $value->save();
                    $perRate --;
                    }
                }
                }
             
        
        }
    }
}
}
