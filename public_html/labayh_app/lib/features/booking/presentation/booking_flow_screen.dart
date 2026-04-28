import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class BookingFlowScreen extends StatefulWidget {
  const BookingFlowScreen({super.key, required this.propertyId});

  final int propertyId;

  @override
  State<BookingFlowScreen> createState() => _BookingFlowScreenState();
}

class _BookingFlowScreenState extends State<BookingFlowScreen> {
  DateTimeRange? _range;
  int _guests = 2;

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('حدد تفاصيل الحجز'),
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('التواريخ', style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              InkWell(
                onTap: () async {
                  final now = DateTime.now();
                  final selected = await showDateRangePicker(
                    context: context,
                    firstDate: now,
                    lastDate: now.add(const Duration(days: 365)),
                    initialDateRange: _range,
                  );
                  if (selected != null) {
                    setState(() => _range = selected);
                  }
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFFE5E2DE)),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Text(
                    _range == null
                        ? 'اختر تاريخ الوصول والمغادرة'
                        : '${_range!.start.toIso8601String().split('T').first} - ${_range!.end.toIso8601String().split('T').first}',
                  ),
                ),
              ),
              const SizedBox(height: 18),
              const Text('عدد الضيوف', style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Row(
                children: [
                  IconButton(
                    onPressed: _guests > 1 ? () => setState(() => _guests -= 1) : null,
                    icon: const Icon(Icons.remove_circle_outline),
                  ),
                  Text('$_guests', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  IconButton(
                    onPressed: () => setState(() => _guests += 1),
                    icon: const Icon(Icons.add_circle_outline),
                  ),
                ],
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _range == null
                      ? null
                      : () {
                          final from = _range!.start.toIso8601String().split('T').first;
                          final to = _range!.end.toIso8601String().split('T').first;
                          context.push(
                            '/booking/quote?property_id=${widget.propertyId}&from=$from&to=$to&guests=$_guests',
                          );
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE51E54),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('عرض السعر', style: TextStyle(color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
