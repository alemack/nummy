<?php
// app/Http/Controllers/AIHelperController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\OpenAIService;

class AIHelperController extends Controller
{
    public function suggestKeywords(Request $request, OpenAIService $ai)
    {
        $topic = $request->input('topic');
        if (!$topic) {
            return response()->json(['error' => 'No topic provided'], 400);
        }

        $keywords = $ai->suggestKeywords($topic);

        return response()->json(['keywords' => $keywords]);
    }
}


