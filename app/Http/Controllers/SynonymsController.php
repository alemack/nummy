<?php
namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class SynonymsController extends Controller
{
    public function index(): JsonResponse
    {
        $path = storage_path('app/query_synonyms.json');
        if (!file_exists($path)) {
            return response()->json(['status'=>'error','message'=>'Файл не найден'],404);
        }
        $dict = json_decode(file_get_contents($path), true);
        return response()->json(['status'=>'success','synonyms'=>$dict]);
    }

    /**
     * PUT /api/synonyms/{term}
     * body: { "synonyms": [["foo",0.5], ["bar",0.3]] }
     */
    public function update(string $term, Request $req): JsonResponse
    {
        $path = storage_path('app/query_synonyms.json');
        $dict = file_exists($path)
            ? json_decode(file_get_contents($path), true)
            : [];

        $data = $req->validate([
            'synonyms'   => 'required|array',
            'synonyms.*' => 'array|size:2',
            'synonyms.*.0'=> 'string',
            'synonyms.*.1'=> 'numeric',
        ]);

        $dict[$term] = $data['synonyms'];
        Storage::disk('local')->put('query_synonyms.json', json_encode($dict, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
        return response()->json(['status'=>'success','synonyms'=>$dict]);
    }
}
