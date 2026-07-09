import Foundation

class NetworkClient {
    static let shared = NetworkClient()
    
    // Localhost on iOS simulator maps directly to the host machine (Express backend on port 3001)
    private let baseURL = "http://localhost:3001/"
    
    private init() {}
    
    enum NetworkError: Error {
        case invalidURL
        case noData
        case decodingError
        case httpError(statusCode: Int, message: String)
        case custom(String)
    }
    
    func request<T: Decodable>(
        path: String,
        method: String = "GET",
        body: [String: Any]? = nil
    ) async throws -> T {
        guard let url = URL(string: baseURL + path) else {
            throw NetworkError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let body = body {
            request.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.noData
        }
        
        if !(200...299).contains(httpResponse.statusCode) {
            let errorMessage = String(data: data, encoding: .utf8) ?? "Server error occurred"
            throw NetworkError.httpError(statusCode: httpResponse.statusCode, message: errorMessage)
        }
        
        // Try decoding directly
        let decoder = JSONDecoder()
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            // Try decoding using snake case converter keys fallback
            do {
                let snakeDecoder = JSONDecoder()
                snakeDecoder.keyDecodingStrategy = .convertFromSnakeCase
                return try snakeDecoder.decode(T.self, from: data)
            } catch {
                throw NetworkError.decodingError
            }
        }
    }
}
