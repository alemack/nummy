<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ActivityLog;
use MongoDB\BSON\ObjectId;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->getAuthIdentifier();

        $entries = ActivityLog::where('user_id', new ObjectId($userId))
            ->orderBy('timestamp', 'desc')
            ->limit(50)
            ->get(['timestamp','description']);

        return response()->json(['entries' => $entries]);
    }
}
