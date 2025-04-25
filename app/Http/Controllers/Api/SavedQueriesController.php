<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SavedQuery;
use MongoDB\BSON\ObjectId;

class SavedQueriesController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->getAuthIdentifier();

        $queries = SavedQuery::where('user_id', new ObjectId($userId))
            ->orderBy('_id', 'desc')
            ->get(['_id','query']);

        return response()->json(['queries' => $queries]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'query' => 'required|string|max:255',
        ]);

        $sq = SavedQuery::create([
            'user_id'    => new ObjectId($request->user()->getAuthIdentifier()),
            'query'      => $request->input('query'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['query' => $sq]);
    }

    public function destroy(Request $request, $id)
    {
        $userId = $request->user()->getAuthIdentifier();

        $deleted = SavedQuery::where('_id', new ObjectId($id))
            ->where('user_id', new ObjectId($userId))
            ->delete();

        return response()->json(['deleted' => (bool)$deleted]);
    }
}
