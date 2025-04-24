<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class MetricsController extends Controller
{
    /**
     * Executes a Python script for evaluation within a virtual environment.
     *
     * The method runs a Python script located in the application's base path
     * using a virtual environment interpreter. It sets a timeout for the process
     * execution, handles any errors that occur during the process, and returns
     * a JSON response with the status and output of the script execution.
     *
     * @return \Illuminate\Http\JsonResponse JSON response containing the execution status
     *                                       and output, or an error message in case of failure.
     * @throws \Symfony\Component\Process\Exception\ProcessFailedException If the process encounters an error.
     */
    public function runEvaluation()
    {
        $scriptPath = base_path('scripts/python/evaluate_search.py');
        $venvPython = base_path('scripts/python/venv/Scripts/python.exe');

        $process = new Process([$venvPython, $scriptPath]);
        $process->setTimeout(600); // до 10 минут

        try {
            $process->mustRun();
            return response()->json([
                'status' => 'success',
                'output' => $process->getOutput(),
            ]);
        } catch (ProcessFailedException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'output' => $process->getErrorOutput(),
            ], 500);
        }
    }
}
